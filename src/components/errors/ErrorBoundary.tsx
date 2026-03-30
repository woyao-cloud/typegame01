// T4.6 - 错误边界组件

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * 错误边界组件
 * 捕获并显示子组件中的错误
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    // 刷新页面
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
          <Card className="w-full max-w-lg bg-white shadow-xl border-4 border-red-400">
            <CardHeader className="text-center pb-4">
              <div className="text-6xl mb-4">😕</div>
              <CardTitle className="text-2xl font-bold text-red-600">
                出错了！
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm text-red-800 font-medium mb-2">
                  错误信息：
                </p>
                <p className="text-sm text-gray-600 font-mono">
                  {this.state.error?.message || '未知错误'}
                </p>
              </div>

              {this.state.errorInfo && (
                <details className="text-xs">
                  <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
                    查看详细错误信息
                  </summary>
                  <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto max-h-40 text-gray-600">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={this.handleReset}
                  className="flex-1 h-12 bg-red-500 hover:bg-red-600"
                >
                  刷新页面
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
