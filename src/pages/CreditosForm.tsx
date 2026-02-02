import React, { useEffect } from 'react'
import LineCreditos from './LineCreditos'

const CreditosForm: React.FC = () => {

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <>
      <LineCreditos />
    </>
  )
}

export default CreditosForm
