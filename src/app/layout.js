import './globals.css'
import { AuthProvider } from '../contexts/AuthContext'
import { SyncProvider } from '../contexts/SyncContext'
import { ReactScanProvider } from '../components/ReactScanProvider'

export const metadata = {
    title: 'BillBuddy - Your Shared Expense Tracker',
    description: 'Track and split group expenses easily with BillBuddy',
}

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
            <head>
                <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>💰</text></svg>" />
            </head>
            <body suppressHydrationWarning>
                <ReactScanProvider>
                    <AuthProvider>
                        <SyncProvider>
                            {children}
                        </SyncProvider>
                    </AuthProvider>
                </ReactScanProvider>
            </body>
        </html>
    )
}

