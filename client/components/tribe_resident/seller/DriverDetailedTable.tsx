import React, { useEffect } from "react"
import { DriverTimeDetail } from '@/interfaces/driver/driver'
import { Button } from '@/components/ui/button'

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"


interface driverProp {
  drivers: DriverTimeDetail[]
}
export const DriverDetailedTable:React.FC<driverProp> = (prop) => {
  
  return (
    <Table>
      <TableHeader>
        <TableRow className="flex flex-row w-screen">
          <TableHead className="text-center lg:text-lg text-md w-1/4">司機姓名</TableHead>
          <TableHead className="text-center lg:text-lg text-md w-1/4">運送日期</TableHead>
          <TableHead className="text-center lg:text-lg text-md w-1/4">運送時間</TableHead>
          <TableHead className="text-center lg:text-lg text-md w-1/4">起始點</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody> 
        {prop.drivers.map((driver) => (
          <TableRow key={driver.id.toString()} className="flex flex-row items-center">
            <TableCell className="text-center lg:text-lg text-md text-balance w-1/4">{driver.driver_name}</TableCell>
            <TableCell className="text-center lg:text-lg text-md text-balance w-1/4">{driver.date}</TableCell>
            <TableCell className="text-center lg:text-lg text-md text-balance w-1/4">{driver.start_time}</TableCell>
            <TableCell className="text-center lg:text-lg text-md text-balance w-1/4">{driver.locations}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      
    </Table>
  )
}