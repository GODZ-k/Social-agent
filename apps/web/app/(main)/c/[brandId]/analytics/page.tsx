import AnalyticsPage from '@/modules/analytics/templates/analytics-page'
import React from 'react'

function page(props:{
  params: Promise<{ brandId: string }>;
  searchParams: Promise<{ range?: string }>;
}) {
  return (
    <AnalyticsPage {...props}/>
  )
}

export default page