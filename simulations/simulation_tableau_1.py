#!/usr/bin/env python3
"""
Cosmological Mosaic Simulation - α–χ Model Table 1
==================================================

This simulation illustrates the four cosmological regions described in 
Table 1 of the α–χ model: Dense Forests, Savannas, Deserts, and Primordial Oceans.

The regions emerge from a reaction–diffusion competition between α-energy and χ-points.

Author: Generated for My Agile Toolkit Simulations
Date: 2025
License: MIT
"""

import numpy as np
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation
import argparse
import sys

class AlphaChiSimulation:
    """
    Reaction-diffusion simulation of α–χ cosmological regions.
    """
    
    def __init__(self, width=200, height=200, dt=0.01, dx=1.0):
        """
        Initialize the simulation parameters.
        
        Parameters:
        -----------
        width, height : int
            Grid dimensions
        dt : float
            Time step
        dx : float
            Spatial step
        """
        self.width = width
        self.height = height
        self.dt = dt
        self.dx = dx
        
        # Initialize fields
        self.alpha = np.random.random((height, width)) * 0.1
        self.chi = np.random.random((height, width)) * 0.1
        
        # Simulation parameters
        self.D_alpha = 0.2  # Diffusion coefficient for α-energy
        self.D_chi = 0.1    # Diffusion coefficient for χ-points
        self.f = 0.04       # Feed rate
        self.k = 0.06       # Kill rate
        
    def laplacian(self, field):
        """Calculate the Laplacian using finite differences."""
        lapl = np.zeros_like(field)
        lapl[1:-1, 1:-1] = (field[2:, 1:-1] + field[:-2, 1:-1] + 
                           field[1:-1, 2:] + field[1:-1, :-2] - 
                           4 * field[1:-1, 1:-1]) / (self.dx**2)
        return lapl
    
    def step(self):
        """Perform one simulation step."""
        # Gray-Scott reaction-diffusion equations adapted for α–χ model
        lap_alpha = self.laplacian(self.alpha)
        lap_chi = self.laplacian(self.chi)
        
        # Reaction terms
        reaction = self.alpha * self.chi**2
        
        # Update equations
        d_alpha = (self.D_alpha * lap_alpha - reaction + 
                  self.f * (1 - self.alpha)) * self.dt
        d_chi = (self.D_chi * lap_chi + reaction - 
                (self.f + self.k) * self.chi) * self.dt
        
        self.alpha += d_alpha
        self.chi += d_chi
        
        # Ensure non-negative values
        self.alpha = np.clip(self.alpha, 0, 1)
        self.chi = np.clip(self.chi, 0, 1)
    
    def get_regions(self):
        """
        Classify regions based on α and χ concentrations.
        
        Returns:
        --------
        regions : numpy.ndarray
            Classified regions:
            0: Primordial Oceans (low α, low χ)
            1: Deserts (low α, high χ)
            2: Savannas (medium α, medium χ)
            3: Dense Forests (high α, low χ)
        """
        regions = np.zeros_like(self.alpha, dtype=int)
        
        # Thresholds for classification
        alpha_low, alpha_high = 0.3, 0.7
        chi_low, chi_high = 0.3, 0.7
        
        # Primordial Oceans: low α, low χ
        mask = (self.alpha < alpha_low) & (self.chi < chi_low)
        regions[mask] = 0
        
        # Deserts: low α, high χ
        mask = (self.alpha < alpha_low) & (self.chi >= chi_low)
        regions[mask] = 1
        
        # Dense Forests: high α, low χ
        mask = (self.alpha >= alpha_high) & (self.chi < chi_low)
        regions[mask] = 3
        
        # Savannas: everything else (medium values)
        mask = (regions == 0) & ((self.alpha >= alpha_low) | (self.chi >= chi_low))
        regions[mask] = 2
        
        return regions
    
    def plot_state(self, save_path=None):
        """Plot the current simulation state."""
        regions = self.get_regions()
        
        # Color map for regions
        colors = ['#000080', '#8B4513', '#90EE90', '#006400']  # Ocean, Desert, Savanna, Forest
        region_names = ['Primordial Oceans', 'Deserts', 'Savannas', 'Dense Forests']
        
        fig, axes = plt.subplots(1, 3, figsize=(15, 5))
        
        # Plot α field
        im1 = axes[0].imshow(self.alpha, cmap='viridis', vmin=0, vmax=1)
        axes[0].set_title('α-energy Field')
        axes[0].axis('off')
        plt.colorbar(im1, ax=axes[0])
        
        # Plot χ field
        im2 = axes[1].imshow(self.chi, cmap='plasma', vmin=0, vmax=1)
        axes[1].set_title('χ-points Field')
        axes[1].axis('off')
        plt.colorbar(im2, ax=axes[1])
        
        # Plot regions
        im3 = axes[2].imshow(regions, cmap='Set1', vmin=0, vmax=3)
        axes[2].set_title('Cosmological Regions')
        axes[2].axis('off')
        
        # Add legend
        from matplotlib.patches import Patch
        legend_elements = [Patch(facecolor=colors[i], label=region_names[i]) 
                          for i in range(4)]
        axes[2].legend(handles=legend_elements, loc='upper right', bbox_to_anchor=(1.3, 1))
        
        plt.tight_layout()
        
        if save_path:
            plt.savefig(save_path, dpi=150, bbox_inches='tight')
        
        return fig

def main():
    """Main simulation function."""
    parser = argparse.ArgumentParser(description='α–χ Cosmological Simulation')
    parser.add_argument('--steps', type=int, default=1000, 
                       help='Number of simulation steps')
    parser.add_argument('--save-interval', type=int, default=100,
                       help='Interval for saving snapshots')
    parser.add_argument('--output-dir', type=str, default='.',
                       help='Output directory for results')
    parser.add_argument('--animate', action='store_true',
                       help='Create animation instead of static images')
    
    args = parser.parse_args()
    
    print("Initializing α–χ Cosmological Simulation...")
    sim = AlphaChiSimulation()
    
    if args.animate:
        print("Creating animation...")
        fig, ax = plt.subplots(figsize=(8, 8))
        
        def animate(frame):
            for _ in range(10):  # Multiple steps per frame
                sim.step()
            regions = sim.get_regions()
            ax.clear()
            ax.imshow(regions, cmap='Set1', vmin=0, vmax=3)
            ax.set_title(f'Cosmological Mosaic - Step {frame * 10}')
            ax.axis('off')
            return []
        
        anim = FuncAnimation(fig, animate, frames=args.steps//10, 
                           interval=50, blit=False)
        anim.save(f'{args.output_dir}/evolution_mosaique_cosmique.gif', 
                 writer='pillow', fps=20)
        print(f"Animation saved to {args.output_dir}/evolution_mosaique_cosmique.gif")
    
    else:
        print(f"Running simulation for {args.steps} steps...")
        for step in range(args.steps):
            sim.step()
            
            if step % args.save_interval == 0:
                print(f"Step {step}/{args.steps}")
                
                if step % (args.save_interval * 5) == 0:  # Save every 5th interval
                    fig = sim.plot_state(f'{args.output_dir}/mosaic_step_{step:06d}.png')
                    plt.close(fig)
        
        # Final state
        fig = sim.plot_state(f'{args.output_dir}/mosaique_finale.png')
        plt.show()
        
        print(f"Final mosaic saved to {args.output_dir}/mosaique_finale.png")

if __name__ == "__main__":
    main()