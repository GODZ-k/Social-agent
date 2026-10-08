import StrategyPage from '@/modules/strategy/templates/strategy-page';
import React from 'react'

export default async function page(props: {
  params: Promise<{ brandId: string }>;
  searchParams: Promise<{ ask?: string }>;
}) {
  return (
    <StrategyPage {...props} />
  )
}
