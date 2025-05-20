import '@testing-library/jest-dom';

// Создаем заглушку для атрибутов изображений, чтобы избежать ошибок
// mock para  atributos de imagenes para evitar los errores.
window.matchMedia = window.matchMedia || function() {
  return {
    matches: false,
    addListener: function() {},
    removeListener: function() {}
  };
};
// Мок для window.matchMedia
window.matchMedia = window.matchMedia || function() {
  return {
    matches: false,
    addListener: function() {},
    removeListener: function() {}
  };
};

// mock para Image con jsdom
class MockImage {
  onload: (() => void) | null = null;
  src: string = '';
  width: number = 0;
  height: number = 0;
  
  constructor(width?: number, height?: number) {
    if (width) this.width = width;
    if (height) this.height = height;
  }
}

// Используем Object.defineProperty вместо прямого присваивания
Object.defineProperty(global, 'Image', {
  value: MockImage,
  writable: true
});
// Заглушка для запросов изображений
// mock para r
//window.Image = class {
  //onload() {}
  //set src(_) {}
//};

// Подготовка для работы с изображениями в тестах
const originalCreateElement = document.createElement.bind(document);
document.createElement = (tagName: string) => {
  if (tagName.toLowerCase() === 'img') {
    const img = originalCreateElement(tagName);
    // Отложенное выполнение для предотвращения ошибок загрузки изображений
    setTimeout(() => {
      if (img.onload) {
        img.onload({} as Event);
      }
    }, 0);
    return img;
  }
  return originalCreateElement(tagName);
};