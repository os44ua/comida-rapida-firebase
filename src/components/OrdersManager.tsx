// OrdersManager para gestionar los pedidos para realizar operaciones de CRUD - read, update, delete.
import React, { useState, useEffect } from 'react';
import { ref, onValue, update, remove } from 'firebase/database';
import logger from '../services/logging';
import './OrdersManager.css';
import { db } from '../firebaseConfig';

interface Order {
  id: string;
  foodId: number;
  foodName: string;
  customerName: string;
  phone: string;
  quantity: number;
  totalAmount: number;
  timestamp: string;
}

const OrdersManager: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [newQuantity, setNewQuantity] = useState<number>(1);
  
  //CRUD
  
  // Загрузка заказов при монтировании компонента
  //READ
  useEffect(() => {
    const ordersRef = ref(db, 'orders');
    
    logger.info('Iniciando lectura de pedidos');
    const unsubscribe = onValue(ordersRef, (snapshot) => {
      try {
        setLoading(true);
        if (snapshot.exists()) {
          const ordersData = snapshot.val();
          const ordersArray = Object.entries(ordersData).map(([id, data]) => ({
            id,
            ...(data as any)
          }));
          
          // Сортировка по времени (новые заказы сверху)
          ordersArray.sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
          
          setOrders(ordersArray);
          logger.info(`Se han cargado ${ordersArray.length} pedidos`);
        } else {
          setOrders([]);
          logger.info('No hay pedidos disponibles');
        }
        setLoading(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        logger.error(`Error al cargar pedidos: ${errorMessage}`);
        setError('Error al cargar los pedidos. Por favor, intente de nuevo.');
        setLoading(false);
      }
    });
    
    // Отписка при размонтировании
    return () => {
      unsubscribe();
      logger.debug('Desuscrito de la lectura de pedidos');
    };
  }, []);
  
  // Обновление заказа
  //UPDATE
  const handleUpdateOrder = () => {
    if (!editingOrder || !newQuantity) return;
    
    setLoading(true);
    logger.debug(`Iniciando actualización del pedido: ${editingOrder.id}`);
    
    const orderRef = ref(db, `orders/${editingOrder.id}`);
    const newTotalAmount = (editingOrder.totalAmount / editingOrder.quantity) * newQuantity;
    
    update(orderRef, {
      quantity: newQuantity,
      totalAmount: newTotalAmount
    })
      .then(() => {
        logger.info(`Pedido ${editingOrder.id} actualizado con éxito`);
        setEditingOrder(null);
        setLoading(false);
      })
      .catch((err) => {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        logger.error(`Error al actualizar pedido: ${errorMessage}`);
        setError('Error al actualizar el pedido. Por favor, intente de nuevo.');
        setLoading(false);
      });
  };
  
  // Удаление заказа
  //DELETE
  const handleDeleteOrder = (orderId: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este pedido?')) return;
    
    setLoading(true);
    logger.debug(`Iniciando eliminación del pedido: ${orderId}`);
    
    const orderRef = ref(db, `orders/${orderId}`);
    
    remove(orderRef)
      .then(() => {
        logger.info(`Pedido ${orderId} eliminado con éxito`);
        setLoading(false);
      })
      .catch((err) => {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        logger.error(`Error al eliminar pedido: ${errorMessage}`);
        setError('Error al eliminar el pedido. Por favor, intente de nuevo.');
        setLoading(false);
      });
  };
  
  // Форматирование даты для отображения
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  
  return (
    <div className="orders-manager">
      <h2>Gestión de Pedidos</h2>
      
      {loading && <div className="loading-indicator">Cargando pedidos...</div>}
      
      {error && <div className="error-message">{error}</div>}
      
      {orders.length === 0 && !loading ? (
        <div className="empty-message">No hay pedidos disponibles</div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <h3>Pedido #{order.id.substring(0, 6)}</h3>
                <span className="order-date">{formatDate(order.timestamp)}</span>
              </div>
              
              <div className="order-details">
                <p><strong>Cliente:</strong> {order.customerName}</p>
                <p><strong>Teléfono:</strong> {order.phone}</p>
                <p><strong>Producto:</strong> {order.foodName}</p>
                <p><strong>Cantidad:</strong> {order.quantity}</p>
                <p><strong>Total:</strong> {order.totalAmount}€</p>
              </div>
              
              <div className="order-actions">
                <button
                  className="edit-button"
                  onClick={() => {
                    setEditingOrder(order);
                    setNewQuantity(order.quantity);
                  }}
                >
                  Editar
                </button>
                <button
                  className="delete-button"
                  onClick={() => handleDeleteOrder(order.id)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Модальное окно для редактирования */}
      {editingOrder && (
        <div className="edit-modal">
          <div className="modal-content">
            <h3>Editar Pedido</h3>
            
            <div className="order-info">
              <p><strong>Cliente:</strong> {editingOrder.customerName}</p>
              <p><strong>Producto:</strong> {editingOrder.foodName}</p>
            </div>
            
            <div className="form-group">
              <label htmlFor="quantity">Nueva cantidad:</label>
              <input
                type="number"
                id="quantity"
                min="1"
                value={newQuantity}
                onChange={(e) => setNewQuantity(parseInt(e.target.value) || 1)}
              />
            </div>
            
            <div className="modal-actions">
              <button className="cancel-button" onClick={() => setEditingOrder(null)}>
                Cancelar
              </button>
              <button className="save-button" onClick={handleUpdateOrder}>
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersManager;