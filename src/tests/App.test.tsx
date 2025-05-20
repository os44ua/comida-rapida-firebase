import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup, within  } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';


describe('Comida Rápida App Tests', () => {
  // Clean up after each test
  afterEach(() => {
    cleanup();
  });

  // Test 1: Check that the initial menu shows four products with stock, image, and name
  it('muestra cuatro productos en la carta inicial con stocks, imagen y nombre', async () => {
    render(<App />);
    
    // Verificamos que el título principal está presente
    expect(screen.getByText('Comida Rápida Online')).toBeInTheDocument();
    
    // Verificamos que hay cuatro elementos de menú
    const menuItems = screen.getAllByRole('listitem');
    expect(menuItems.length).toBe(4);
    
    // Verificamos que cada elemento tiene un nombre y cantidad
    expect(screen.getByText('Hamburguesa de Pollo')).toBeInTheDocument();
    expect(screen.getByText('#40')).toBeInTheDocument();
    
    const vegBurgerItem = screen.getByText('Hamburguesa Vegetariana').closest('li');
    // Проверяем, что элемент найден, прежде чем использовать within
   // Verificamos que el elemento se ha encontrado
    expect(vegBurgerItem).not.toBeNull(); // 
    if (vegBurgerItem) {
    expect(within(vegBurgerItem).getByText(/#30/)).toBeInTheDocument();
    }
        
    expect(screen.getByText('Patatas Fritas')).toBeInTheDocument();
    expect(screen.getByText('#50')).toBeInTheDocument();
    
    const iceCreamItem = screen.getByText('Helado').closest('li');
    expect(iceCreamItem).not.toBeNull();   // Verificamos que el elemento se ha encontrado
    if (iceCreamItem) {
    expect(within(iceCreamItem).getByText(/#30/)).toBeInTheDocument();
    }
  });

  // Test 2: Check that the "Pedir Comida" page shows four products with prices
  it('muestra cuatro productos y sus precios en la pantalla de Pedir Comida', async () => {
    // Render the app
    render(<App />);
    
    // Click on "Pedir Comida" button
    const user = userEvent.setup();
    await user.click(screen.getByText('Pedir Comida'));
    
    // Check the title
    //expect(screen.getByText('Carta')).toBeInTheDocument();
    // por carga diferida tenemos timeout para esperar
    await screen.findByText('Carta', {}, { timeout: 3000 });
    
    // Check that all four products are shown
    const productDescriptions = [
      'Hamburguesa de pollo frito - lechuga, tomate, queso y mayonesa',
      'Hamburguesa verde - lechuga, tomate, queso vegano y mayonesa',
      'Patatas crujientes con sal y especias',
      'Helado casero de vainilla con toppings'
    ];
    
    for (const desc of productDescriptions) {
      expect(screen.getByText(desc)).toBeInTheDocument();
    }
    
    // Check the prices
    expect(screen.getByText('24€')).toBeInTheDocument();
    expect(screen.getByText('22€')).toBeInTheDocument();
    expect(screen.getByText('8€')).toBeInTheDocument();
    expect(screen.getByText('6€')).toBeInTheDocument();
    
    // Check for images (by their role)
    const images = screen.getAllByRole('img');
    expect(images.length).toBe(4);
  });

  // Test 3: Check that the price updates correctly when changing quantity
  it('actualiza correctamente el precio para una cantidad introducida en la compra', async () => {
    // Render the app
    render(<App />);
    
    // Setup user event
    const user = userEvent.setup();
    
    // Go to "Pedir Comida" screen
    await user.click(screen.getByText('Pedir Comida'));
    
    // Click on the first product (Hamburguesa de Pollo)
    const products = screen.getAllByRole('listitem');
    await user.click(products[0]);
    
    // Check initial price - single item
    expect(screen.getByText('24€ por unidad')).toBeInTheDocument();
    expect(screen.getByText('Total: 24€')).toBeInTheDocument();
    
    // Find quantity input
    const quantityInput = screen.getByLabelText('Cantidad:');
    
    // Change quantity to 3
    await user.clear(quantityInput);
    await user.type(quantityInput, '3');
    
    // Check updated price (24 * 3 = 72)
    expect(screen.getByText('Total: 72€')).toBeInTheDocument();
    
    // Change quantity to 5
    await user.clear(quantityInput);
    await user.type(quantityInput, '5');
    
    // Check updated price again (24 * 5 = 120)
    expect(screen.getByText('Total: 120€')).toBeInTheDocument();
  });
});