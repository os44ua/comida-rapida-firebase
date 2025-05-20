import React from 'react';
import type { MenuItem } from '../entities/entities';

interface CartProps {
  cartItems: { item: MenuItem; quantity: number }[];
  onRemoveItem: (id: number) => void;
}

const Cart: React.FC<CartProps> = ({ cartItems, onRemoveItem }) => {
  const total = cartItems.reduce((sum, i) => sum + i.item.price * i.quantity, 0);

  return (
    <div className="cart-container">
      <h3>Carrito de compras</h3>
      {cartItems.length === 0 ? (
        <p>Tu carrito está vacío.</p>
      ) : (
        <ul>
          {cartItems.map(({ item, quantity }) => (
            <li key={item.id} className="cart-item">
              {item.name} x{quantity} - {item.price * quantity}€
              <button onClick={() => onRemoveItem(item.id)}>Eliminar</button>
            </li>
          ))}
        </ul>
      )}
      <p className="total-price">Total: {total}€</p>
    </div>
  );
};

export default Cart;

