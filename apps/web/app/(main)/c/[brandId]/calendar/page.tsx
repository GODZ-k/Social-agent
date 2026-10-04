import CalendarPage from '@/components/calendar/calendar-page';
import React from 'react'

function page(props:{
    params: Promise<{ brandId: string }>;
}) {
  return (
    <CalendarPage {...props}/>
  )
}

export default page