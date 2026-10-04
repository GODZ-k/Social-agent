import OverviewPage from '@/components/overview/overview-page';
import React from 'react'

export default async function page(props: {
  params: Promise<{ brandId: string }>;
  searchParams: Promise<{ post?: string }>;
}) {
  return (
    <OverviewPage {...props} />
  )
}
