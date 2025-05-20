import { useState, createContext, useEffect } from 'react'
import './App.css'
import type { MenuItem } from './entities/entities'
import { lazy, Suspense } from 'react';
import FoodOrder from './components/FoodOrder';
import Cart from './components/Cart';
import ErrorBoundary from './components/ErrorBoundary';
import logger from './services/logging';
import OrdersManager from './components/OrdersManager';



// для carga diferida
const Foods = lazy(() => import('./components/Foods'));

// creacion de contextos
export const foodItemsContext = createContext<MenuItem[]>([]);
export const cartUpdateContext = createContext<(id: number, qty: number) => void>(() => {});

function App() {
 //const [showError, setShowError] = useState(false);// para probar ErrorBoundary
 const [isChooseFoodPage, setIsChooseFoodPage] = useState(false);
 const [showCart, setShowCart] = useState(false);
 const [menuItems, setMenuItems] = useState<MenuItem[]>([
    {
      id: 1,
      name: "Hamburguesa de Pollo",
      quantity: 40,
      desc: "Hamburguesa de pollo frito - lechuga, tomate, queso y mayonesa",
      price: 24,
      image: "cb.jpeg",
    },
    {
      id: 2,
      name: "Hamburguesa Vegetariana",
      quantity: 30,
      desc: "Hamburguesa verde - lechuga, tomate, queso vegano y mayonesa",
      price: 22,
      image: "vb.jpg",
    },
    {
      id: 3,
      name: "Patatas Fritas",
      quantity: 50,
      desc: "Patatas crujientes con sal y especias",
      price: 8,
      image: "chips.jpeg",
    },
    {
      id: 4,
      name: "Helado",
      quantity: 30,
      desc: "Helado casero de vainilla con toppings",
      price: 6,
      image: "ic.jpeg",
    },
  ]);
  
  //para FoodOrder
  const [selectedFood, setSelectedFood] = useState<MenuItem | null>(null);
  
  //para el carrito
  const [cart, setCart] = useState<{ item: MenuItem; quantity: number }[]>([]);

  // para OrdersManager CRUD seseion 6
  const [showOrdersManager, setShowOrdersManager] = useState(false);
  
  // refresh carrito
  const updateCartWithFood = (foodId: number, quantity: number) => {
    logger.debug(`Actualizando carrito: producto ID ${foodId}, cantidad ${quantity}`);
    const item = menuItems.find(item => item.id === foodId);
    if (item) {
      setCart(prevCart => {
        const existingItem = prevCart.find(cartItem => cartItem.item.id === foodId);
        if (existingItem) {
          logger.info(`Producto existente actualizado: ${item.name}, nueva cantidad: ${existingItem.quantity + quantity}`);
          return prevCart.map(cartItem =>
            cartItem.item.id === foodId
              ? { ...cartItem, quantity: cartItem.quantity + quantity }
              : cartItem
          );
        } else {
          logger.info(`Nuevo producto añadido al carrito: ${item.name}, cantidad: ${quantity}`);
          return [...prevCart, { item, quantity }];
        }
      });
    }
  };

  const handleRemoveFromCart = (id: number) => {
    logger.debug(`Eliminando producto del carrito: ID ${id}`);
    setCart(prevCart => {
      const itemToRemove = prevCart.find(cartItem => cartItem.item.id === id);
      if (itemToRemove) {
        // Devolver cantidad al stock
        setMenuItems(prevItems =>
          prevItems.map(item =>
            item.id === id ? { ...item, quantity: item.quantity + itemToRemove.quantity } : item
          )
        );
        // Eliminar del carrito
        logger.info(`Producto eliminado del carrito: ${itemToRemove.item.name}`);
        return prevCart.filter(cartItem => cartItem.item.id !== id);
      }
      return prevCart;
    });
  };

  const getTotalCartItems = () => {
    return cart.reduce((total, cartItem) => total + cartItem.quantity, 0);
  };

  // Логирование при загрузке приложения
  useEffect(() => {
    logger.info("Aplicación iniciada");
    return () => {
      logger.info("Aplicación finalizada");
    };
  }, []);

  // Запасной UI для ErrorBoundary
  const errorFallback = (
    <div className="errorFallback">
      <h2>¡Algo salió mal!</h2>
      <p>Ha ocurrido un error inesperado. Por favor, intenta recargar la página.</p>
      <button onClick={() => window.location.reload()}>Recargar página</button>
    </div>
  );


  /*
// ========= НАЧАЛО КОДА ДЛЯ ПРОВЕРКИ ERROR BOUNDARY =========
  //========= para mostrar funcionamiento codigo con ERROR BOUNDARY =========
  // Componente con error para probar ErrorBoundary
  const ErrorComponent = () => {
  // Намеренно вызываем ошибку прямо при рендеринге
  //error en rendering
  throw new Error("Error de prueba para ErrorBoundary");
  // Этот код никогда не выполнится
  //este codigo nunca no va a ejecutar
  return <div>Nunca verás este texto</div>;
  };
// ========= КОНЕЦ КОДА ДЛЯ ПРОВЕРКИ ERROR BOUNDARY =========
*/

 return (
    <ErrorBoundary fallback={errorFallback}>
      <foodItemsContext.Provider value={menuItems}>
        <cartUpdateContext.Provider value={updateCartWithFood}>
          <div className="app-container">
            <div className="header-buttons">
              <button className="toggleButton" onClick={() => setIsChooseFoodPage(!isChooseFoodPage)}> 
                {isChooseFoodPage ? "Disponibilidad" : "Pedir Comida"} 
              </button>
              <button className="cartButton" onClick={() => setShowCart(!showCart)}>
                Carrito ({getTotalCartItems()})
              </button>
              
              {/* Добавляем кнопку для управления заказами */}
              <button
                className="ordersButton"
                onClick={() => {
                  logger.debug('Accediendo a la gestión de pedidos');
                  setShowOrdersManager(!showOrdersManager);
                }}
              >
                {showOrdersManager ? "Cerrar Pedidos" : "Gestionar Pedidos"}
              </button>

              {/* Boton para Test ErrorBoundary */}
              {/*
                <button 
                  onClick={() => setShowError(true)}
                  style={{
                    backgroundColor: 'red',
                    color: 'white',
                    padding: '8px',
                    border: 'none',
                    borderRadius: '4px',
                    margin: '10px'
                  }}
                >
                  Test ErrorBoundary
                </button>
                {showError && <ErrorComponent />}
              */}
            </div>
            
            <h3 className="title">Comida Rápida Online</h3>
            
            {showCart && (
              <Cart cartItems={cart} onRemoveItem={handleRemoveFromCart} />
            )}
            
            {/* Показываем менеджер заказов, если он активен */}
            {showOrdersManager ? (
              <OrdersManager />
            ) : (
              <>
                {!isChooseFoodPage && (       
                  <>
                    <h4 className="subTitle">Menús</h4> 
                    <ul className="ulApp"> 
                      {menuItems.map((item) => { 
                        return ( 
                          <li key={item.id} className="liApp" onClick={() => setSelectedFood(item)}> 
                            <p>{item.name}</p><p>#{item.quantity}</p> 
                          </li> 
                        ); 
                      })} 
                    </ul>
                  </>
                )} 
              
                {isChooseFoodPage && (
                  selectedFood ? (
                    <FoodOrder
                      food={selectedFood}
                      onReturnToMenu={() => setSelectedFood(null)}
                    />
                  ) : (
                    <Suspense fallback={<div>Cargando detalles…</div>}>
                      <Foods onFoodSelected={setSelectedFood} />
                    </Suspense>
                  )
                )}
              </>
            )}
          </div>
        </cartUpdateContext.Provider>
      </foodItemsContext.Provider>
    </ErrorBoundary>
  );
}

export default App