import StrategyPage from '@/components/strategy/strategy-page';
import React from 'react'

export default async function page(props: {
  params: Promise<{ brandId: string }>;
  searchParams: Promise<{ ask?: string }>;
}) {
  return (
    <StrategyPage {...props} />
  )
}
