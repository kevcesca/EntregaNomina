import { Inter } from 'next/font/google';
import './globals.css';
import 'primereact/resources/themes/saga-blue/theme.css'; 
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { AuthProvider } from './context/AuthContext';
import AuthWrapper from './%Components/Wrapper/AuthWrapper';
import AuthProviderWrapper from './%Components/Wrapper/SessionProviderWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Sistema de nomina',
  description: 'Sistema de nómina para la alcaldía Azcapotzalco',
};

export default function RootLayout({ children }) {
  return (
    <html lang='es' suppressHydrationWarning>
      <head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={inter.className}>
        <AuthProviderWrapper>
          <AuthProvider>
              <AuthWrapper>
                {children}
              </AuthWrapper>
          </AuthProvider>
        </AuthProviderWrapper>
      </body>
    </html>
  );
}
