import { Component, type ErrorInfo, type ReactNode} from 'react';
import logger from '../services/logging';

interface ErrorBoundaryProps {
  fallback: ReactNode;
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    // Обновляем состояние, чтобы при следующем рендере показать запасной UI
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Логируем ошибку
    logger.error(`Error capturado por ErrorBoundary: ${error.message}`);
    logger.debug(`Detalles del error: ${info.componentStack}`);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Возвращаем запасной UI
      return this.props.fallback;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;