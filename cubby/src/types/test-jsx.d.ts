import 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'mock-node': any;
    }
  }
}
