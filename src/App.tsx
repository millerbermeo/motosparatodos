import React, { Suspense } from 'react'
import AppRouter from './config/AppRouter'
import { Loader } from 'lucide-react'
import GlobalModal from './shared/components/GlobalModal'

const App: React.FC = () => {
  return (
    <>
      <Suspense fallback={<div className='w-full h-screen bg-black flex justify-center items-center'><Loader /></div>}>
        <AppRouter />
        <GlobalModal />
      </Suspense>
    </>
  )
}

export default App