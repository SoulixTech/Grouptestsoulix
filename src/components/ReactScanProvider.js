'use client'

import { useEffect } from 'react'

export function ReactScanProvider({ children }) {
    useEffect(() => {
        const initScan = async () => {
            if (process.env.NODE_ENV === 'development') {
                const { scan } = await import('react-scan')
                scan({
                    enabled: true,
                    log: true,
                    apiKey: 'Q1x99RILEC1m5FeqC7TET',
                })
            }
        }
        initScan()
    }, [])

    return children
}
