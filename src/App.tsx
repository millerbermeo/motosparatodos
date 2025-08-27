import React, { Suspense } from 'react'
import AppRouter from './config/AppRouter'
import GlobalModal from './shared/components/GlobalModal'
import Loader from './utils/Loader'

const App: React.FC = () => {
  return (
    <>
      <Suspense fallback={<div className='w-full h-screen bg-black flex justify-center items-center'><Loader /></div>}>
        <AppRouter />
        <GlobalModal />
         <Loader />
      </Suspense>
    </>
  )
}

export default App