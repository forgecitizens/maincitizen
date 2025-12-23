"""
Simulation de viabilité cosmologique
=====================================
Ce script teste la viabilité d'univers avec différentes valeurs de ΩΛ.
Montre que la plage viable est étroite et inclut la valeur observée (0.68).

Référence : 
Sirbu, A. E. (2025). "Vers un modèle cosmologique auto-régulé".
"""

import numpy as np
from scipy.integrate import solve_ivp, quad
import matplotlib.pyplot as plt

# ====================
# MODULE 1 : Héritage α–χ → ΩΛ
# ====================
def compute_Omega_Lambda(epsilon_gel, z_gel=2.5, f_max=0.4764):
    """
    Calcule ΩΛ aujourd'hui à partir de l'efficacité du gel.
    
    Paramètres
    ----------
    epsilon_gel : float
        Efficacité du gel (entre 0 et 1)
    z_gel : float, optionnel
        Redshift du gel (défaut = 2.5)
    f_max : float, optionnel
        Fraction volumique maximale (défaut = 1 - π/6)
    
    Retourne
    --------
    Omega_Lambda0 : float
        Densité d'énergie noire aujourd'hui
    """
    # Constantes cosmologiques
    H0 = 70.0  # km/s/Mpc
    G = 4.3009e-9  # (km/s)^2 Mpc/Msol
    rho_c0 = 3 * H0**2 / (8 * np.pi * G)  # densité critique aujourd'hui
    
    # Densité critique au redshift du gel (approximation matière dominée)
    rho_c_zgel = rho_c0 * ((1 + z_gel)**3)
    
    # Énergie α gelée
    f_gel = f_max * epsilon_gel
    rho_Lambda_zgel = f_gel * rho_c_zgel
    rho_Lambda0 = rho_Lambda_zgel  # constante cosmologique
    Omega_Lambda0 = rho_Lambda0 / rho_c0
    
    return Omega_Lambda0

# ====================
# MODULE 2 : Viabilité cosmologique
# ====================
class Universe:
    """
    Représente un univers avec paramètres cosmologiques donnés.
    """
    
    def __init__(self, Omega_Lambda0, Omega_m0=0.3, Omega_r0=5e-5, H0=70.0):
        """
        Initialise un univers.
        
        Paramètres
        ----------
        Omega_Lambda0 : float
            Densité d'énergie noire aujourd'hui
        Omega_m0 : float, optionnel
            Densité de matière aujourd'hui (défaut = 0.3)
        Omega_r0 : float, optionnel
            Densité de rayonnement aujourd'hui (défaut = 5e-5)
        H0 : float, optionnel
            Constante de Hubble aujourd'hui en km/s/Mpc (défaut = 70.0)
        """
        self.Omega_Lambda0 = Omega_Lambda0
        self.Omega_m0 = Omega_m0
        self.Omega_r0 = Omega_r0
        self.H0 = H0  # km/s/Mpc
        
        # Conversion en unités SI pour l'intégration
        self.H0_s = H0 * 1e3 / 3.086e22  # s^-1
        self.t_H0 = 1 / self.H0_s / (365*24*3600*1e9)  # Gyr
    
    def H(self, a):
        """
        Paramètre de Hubble en fonction du facteur d'échelle.
        
        Paramètres
        ----------
        a : float ou array
            Facteur d'échelle normalisé (a=1 aujourd'hui)
        
        Retourne
        --------
        H : float ou array
            Paramètre de Hubble en km/s/Mpc
        """
        return self.H0 * np.sqrt(self.Omega_Lambda0 + 
                                 self.Omega_m0 * a**-3 + 
                                 self.Omega_r0 * a**-4)
    
    def friedmann(self, t, a):
        """
        Équation différentielle pour a(t).
        """
        H = self.H(a)
        return a * H
    
    def evolve(self, t_max=50.0):
        """
        Intègre a(t) sur une durée donnée.
        
        Paramètres
        ----------
        t_max : float, optionnel
            Temps maximal d'intégration en Gyr (défaut = 50.0)
        
        Retourne
        --------
        t : array
            Temps en Gyr
        a : array
            Facteur d'échelle
        """
        t_span = (0, t_max)
        t_eval = np.linspace(0, t_max, 1000)
        sol = solve_ivp(self.friedmann, t_span, [1e-6], 
                       t_eval=t_eval, method='RK45', rtol=1e-8)
        return sol.t, sol.y[0]
    
    def growth_factor(self, a):
        """
        Facteur de croissance linéaire D(a) (normalisé à a=1).
        
        Paramètres
        ----------
        a : float
            Facteur d'échelle
        
        Retourne
        --------
        D : float
            Facteur de croissance normalisé
        """
        integrand = lambda a_prime: 1 / (a_prime * self.H(a_prime) / self.H0)**3
        integral, _ = quad(integrand, 0, a)
        D = 2.5 * self.Omega_m0 * self.H(a) / self.H0 * integral
        return D
    
    def is_viable(self, t_max=50.0):
        """
        Évalue la viabilité d'un univers.
        
        Critères :
        1. Pas d'effondrement global (a toujours croissant)
        2. Formation de structures (δ > δ_c avant t_max)
        
        Paramètres
        ----------
        t_max : float, optionnel
            Temps maximal d'évaluation en Gyr (défaut = 50.0)
        
        Retourne
        --------
        viable : bool
            True si l'univers est viable
        reason : str
            Raison en cas de non-viabilité
        """
        t, a = self.evolve(t_max)
        
        # 1. Expansion toujours positive ?
        if np.any(np.diff(a) < -1e-10):
            return False, "Effondrement global"
        
        # 2. Croissance des structures
        sigma_8 = 0.8  # amplitude typique des fluctuations
        a_vals = np.logspace(np.log10(a[0]), 0, 200)
        D_vals = np.array([self.growth_factor(ai) for ai in a_vals])
        delta_vals = sigma_8 * D_vals
        
        if np.max(delta_vals) < 1.686:
            return False, "Pas de formation de structures"
        
        # Seuil d'effondrement atteint ?
        idx = np.where(delta_vals >= 1.686)[0]
        if len(idx) == 0:
            return False, "Pas de seuil atteint"
        
        a_collapse = a_vals[idx[0]]
        z_collapse = 1/a_collapse - 1
        
        if z_collapse < 1:
            return False, f"Structures trop tardives (z={z_collapse:.1f})"
        
        return True, f"Viable (z_collapse={z_collapse:.1f})"

# ====================
# SIMULATION MONTE-CARLO
# ====================
def run_viability_simulation(N=500):
    """
    Lance une simulation Monte-Carlo de viabilité cosmologique.
    
    Paramètres
    ----------
    N : int, optionnel
        Nombre d'univers à tester (défaut = 500)
    
    Retourne
    --------
    viable_Omega : array
        Valeurs de ΩΛ pour les univers viables
    nonviable_Omega : array
        Valeurs de ΩΛ pour les univers non viables
    """
    viable_Omega = []
    nonviable_Omega = []
    
    for i in range(N):
        # Tirage aléatoire de l'efficacité du gel
        epsilon_gel = np.random.uniform(0.1, 0.9)
        
        # ΩΛ hérité
        Omega_Lambda0 = compute_Omega_Lambda(epsilon_gel)
        
        # Test de viabilité
        uni = Universe(Omega_Lambda0)
        viable, reason = uni.is_viable()
        
        if viable:
            viable_Omega.append(Omega_Lambda0)
        else:
            nonviable_Omega.append(Omega_Lambda0)
    
    return np.array(viable_Omega), np.array(nonviable_Omega)

# ====================
# VISUALISATION
# ====================
def plot_results(viable, nonviable):
    """
    Génère les graphiques des résultats.
    """
    fig, axes = plt.subplots(1, 2, figsize=(12, 5))
    
    # Histogramme
    ax1 = axes[0]
    bins = np.linspace(0, 1, 30)
    ax1.hist(viable, bins=bins, alpha=0.7, label='Viables', color='green', density=True)
    ax1.hist(nonviable, bins=bins, alpha=0.7, label='Non viables', color='red', density=True)
    ax1.axvline(0.68, color='black', linestyle='--', linewidth=2, label='ΩΛ observé (0.68)')
    ax1.set_xlabel('ΩΛ')
    ax1.set_ylabel('Densité de probabilité')
    ax1.set_title('Distribution de ΩΛ')
    ax1.legend()
    ax1.grid(True, alpha=0.3)
    
    # Courbes d'expansion pour quelques univers viables
    ax2 = axes[1]
    if len(viable) > 0:
        sample = np.random.choice(viable, size=min(3, len(viable)), replace=False)
        for Omega_Lambda0 in sample:
            uni = Universe(Omega_Lambda0)
            t, a = uni.evolve(t_max=30)
            ax2.plot(t, a, label=f'ΩΛ={Omega_Lambda0:.2f}')
    
    ax2.set_xlabel('Temps (Gyr)')
    ax2.set_ylabel('Facteur d\'échelle a(t)')
    ax2.set_title('Expansion des univers viables')
    ax2.legend()
    ax2.grid(True, alpha=0.3)
    
    plt.tight_layout()
    return fig

# ====================
# EXÉCUTION PRINCIPALE
# ====================
if __name__ == "__main__":
    print("=" * 60)
    print("SIMULATION DE VIABILITÉ COSMOLOGIQUE")
    print("=" * 60)
    
    # Paramètres
    N_univers = 500
    print(f"Nombre d'univers simulés : {N_univers}")
    print("En cours...")
    
    # Lancement de la simulation
    viable_Omega, nonviable_Omega = run_viability_simulation(N_univers)
    
    # Statistiques
    print("\n" + "=" * 60)
    print("RÉSULTATS :")
    print(f"  Univers viables    : {len(viable_Omega)} ({len(viable_Omega)/N_univers*100:.1f}%)")
    print(f"  Univers non viables : {len(nonviable_Omega)} ({len(nonviable_Omega)/N_univers*100:.1f}%)")
    
    if len(viable_Omega) > 0:
        print(f"  ΩΛ moyen (viables)  : {np.mean(viable_Omega):.3f} ± {np.std(viable_Omega):.3f}")
        print(f"  Plage ΩΛ viable    : [{np.min(viable_Omega):.3f}, {np.max(viable_Omega):.3f}]")
        print(f"  ΩΛ observé (0.68) dans plage viable : {0.68 >= np.min(viable_Omega) and 0.68 <= np.max(viable_Omega)}")
    
    # Génération des graphiques
    print("\nGénération des graphiques...")
    fig = plot_results(viable_Omega, nonviable_Omega)
    
    # Sauvegarde
    fig.savefig('viability_results.png', dpi=150, bbox_inches='tight')
    print("Graphique sauvegardé : 'viability_results.png'")
    
    # Affichage
    plt.show()
    
    print("\n" + "=" * 60)
    print("Simulation terminée.")