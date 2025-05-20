import React, { useState, useContext, useEffect } from 'react';
import type { MenuItem } from '../entities/entities';
import './FoodOrder.css';
import { foodItemsContext, cartUpdateContext } from '../App'; 
//añadimos import para seseion 6
import { ref, push } from 'firebase/database';
import logger from '../services/logging';
import { db } from '../firebaseConfig';

interface FoodOrderProps {
  food: MenuItem;
  onReturnToMenu: React.MouseEventHandler<HTMLButtonElement> | undefined;
}

const FoodOrder = ({ food, onReturnToMenu }: FoodOrderProps) => {
  const [totalAmount, setTotalAmount] = useState(food.price); // precio unitario * cantidad
  const [quantity, setQuantity] = useState(1); // cantidad pedida
  const [isOrdered, setIsOrdered] = useState(false); // si está pedido
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');

  // nuevos estados para feedback para seseion 6
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  //Contextos
  const menuItems = useContext(foodItemsContext);
  const updateCart = useContext(cartUpdateContext);


  // la funcion asincrona para añadir los orders a Firebase // PUSH
  const saveOrderToFirebase = async () => {
    try {
      setIsLoading(true);
      logger.info(`Iniciando guardado de pedido para ${customerName}`);
      
      const orderData = {
        foodId: food.id,
        foodName: food.name,
        quantity,
        totalAmount,
        customerName,
        phone,
        timestamp: new Date().toISOString()
      };
      
      const ordersRef = ref(db, 'orders');
      // PUSH
      await push(ordersRef, orderData);
      
      logger.info(`Pedido guardado exitosamente para ${customerName}`);
      setIsLoading(false);
      setIsOrdered(true);
      
      // refresh de candidad de productos
      menuItems.map((item: MenuItem) => {
        if (item.id === food.id) {
          item.quantity = item.quantity - quantity;
        }
        return item;
      });
      
      // refrsch de carrito
      updateCart(food.id, quantity);
      
    } catch (error) {
      logger.error(`Error al guardar pedido: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setError('Ha ocurrido un error al procesar tu pedido. Por favor, inténtalo de nuevo.');
      setIsLoading(false);
    }
  };


  
  /*const handleClick = () => {
    setIsOrdered(true);
    
    // refresh la cantidad de productos
    menuItems.map((item: MenuItem) => {
      if (item.id === food.id) {
        item.quantity = item.quantity - quantity;
      }
    });
    
    // refresh carrito
    updateCart(food.id, quantity);
  };*/

//para sesion 6 con firebase
  const handleClick = () => {
    // validacion de form
    if (!customerName.trim()) {
      setError('Por favor, introduce tu nombre');
      return;
    }
    
    if (!phone.trim()) {
      setError('Por favor, introduce tu número de teléfono');
      return;
    }
    
    // si todo bien, bajamos error por null
    setError(null);
    
    // almacenamos el pedido en database Firebase
    saveOrderToFirebase();
  };

  // Actualizar el precio total cuando cambia la cantidad
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = Number(e.target.value);
    setQuantity(newQuantity);
    setTotalAmount(food.price * newQuantity);
  };

 // logging
  useEffect(() => {
    logger.debug(`Componente FoodOrder montado para ${food.name}`);
    
    return () => {
      logger.debug(`Componente FoodOrder desmontado para ${food.name}`);
    };
  }, [food.name]);

  return (
    <div className="foodOrderContainer">
      <p className="foodOrderTitle">Comida Rápida Online</p>
      <h2>{food.name}</h2>

      {/*<img src={`/images/${food.image}`} alt={food.name} className="foodOrderImg" />*/}
      {/*para publicacion en GitPages cambiamos la ruta de imagenes*/}
     <img 
        src={`${import.meta.env.VITE_APP_BASE_URL || '/'}images/${food.image}`} 
        alt={food.name} 
        className="foodOrderImg" 
      />

      <p className="foodOrderDesc">{food.desc}</p>
      <p className="foodOrderPrice">{food.price}€ por unidad</p>
      <p>Total: {totalAmount}€</p>

      <div className="foodOrderForm">
        <label>
          Cantidad:
          <input
            className="foodOrderInput"
            type="number"
            value={quantity}
            min={1}
            max={food.quantity}
            onChange={handleQuantityChange}
          />
        </label>

        <input
          className="foodOrderInput"
          type="text"
          placeholder="Tu nombre"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
        />

        <input
          className="foodOrderInput"
          type="tel"
          placeholder="Teléfono"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      {/* mostramos el mensaje sobre el error si hay error */}
      {error && <div className="errorMessage">{error}</div>}

      <div className="foodOrderButtons">
        <button className="btnConfirm" onClick={handleClick}  disabled={isLoading} >
         {isLoading ? 'Procesando...' : 'Enviar pedido'}
        </button>
        <button className="btnBack" onClick={onReturnToMenu} disabled={isLoading} >
          Volver al menú
        </button>
      </div>

      {/* indicador de loading */}
      {isLoading && (
        <div className="loadingIndicator">
          Procesando tu pedido, por favor espera...
        </div>
      )}

      {isOrdered && (
        <div className="confirmationBox">
          Pedido enviado. <strong>Recibirás un SMS una vez esté listo para recoger.</strong>
        </div>
      )}
    </div>
  );
};

export default FoodOrder;