import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"


export const ProductDetailDialog = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">查看</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="lg:text-2xl text-lg">其他資訊</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-5 items-center gap-4">
            <p className="lg:text-2xl text-md col-span-2">商品名稱</p>
            <p className="lg:text-2xl text-md col-span-3">芒果</p>
          </div>
          <div className="grid grid-cols-5 items-center gap-4">
            <p className="lg:text-2xl text-md col-span-2">購買日期</p>
            <p className="lg:text-2xl text-md col-span-3">2024-08-03</p>
          </div>
          <div className="grid grid-cols-5 items-center gap-4">
            <p className="lg:text-2xl col-span-2">購買數量</p>
            <p className="lg:text-2xl col-span-3">2</p>
          </div>
        </div>
        
      </DialogContent>
    </Dialog>
  )
}
