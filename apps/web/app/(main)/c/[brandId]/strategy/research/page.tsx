import StrategyResearchPage from '@/modules/strategy/templates/research-page';
import React from 'react'

function page(props:{
  params: Promise<{ brandId: string }>;
}) {
  return (
    <StrategyResearchPage {...props} />
  )
}

export default page