# Simulations α–χ

This directory contains cosmological simulations for the α–χ model.

## Files Structure

```
simulations/
├── simulation_tableau_1.py          # Main simulation script
├── alpha-chi-mosaic/
│   ├── mosaique_finale.png          # Final mosaic image
│   ├── evolution_mosaique_cosmique.gif  # Evolution animation
│   └── alpha-chi-mosaic.zip         # Complete archive (optional)
└── README.md                        # This file
```

## Running the Simulation

### Requirements
```bash
pip install numpy matplotlib
```

### Basic Usage
```bash
python simulation_tableau_1.py --steps 2000
```

### Generate Animation
```bash
python simulation_tableau_1.py --animate --steps 1000 --output-dir alpha-chi-mosaic/
```

### Command Line Options
- `--steps`: Number of simulation steps (default: 1000)
- `--save-interval`: Interval for saving snapshots (default: 100)
- `--output-dir`: Output directory for results (default: current directory)
- `--animate`: Create animation instead of static images

## Cosmological Regions

The simulation models four distinct cosmological regions based on the α–χ model:

1. **Primordial Oceans** (Blue): Low α-energy, low χ-points
2. **Deserts** (Brown): Low α-energy, high χ-points  
3. **Savannas** (Light Green): Medium α-energy, medium χ-points
4. **Dense Forests** (Dark Green): High α-energy, low χ-points

These regions emerge naturally from the reaction-diffusion dynamics between α-energy and χ-points, creating a complex cosmological mosaic.

## Technical Details

The simulation uses a modified Gray-Scott reaction-diffusion system with:
- Diffusion coefficients: D_α = 0.2, D_χ = 0.1
- Feed rate: f = 0.04
- Kill rate: k = 0.06
- Grid size: 200×200 (configurable)
- Time step: dt = 0.01

## Integration with My Agile Toolkit

This simulation is integrated into the Windows 98-style desktop interface of My Agile Toolkit. The results can be viewed directly in the Simulations window, which displays:
- The final cosmological mosaic
- An animated evolution of the system
- Download links for the simulation code

## License

MIT License - See main project for details.