import { NextPage } from 'next'
import { useRouter } from 'next/router'
import React from 'react'

const Detail: NextPage = () => {
  const router = useRouter()
  const { id } = router.query
  return <div>detail: {id}</div>
}

export default Detail
