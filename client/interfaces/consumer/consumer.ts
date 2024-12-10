

export interface AddCartRequest {
    buyer_id: Number
    produce_id: Number
    quantity: Number
  }

  export interface PurchasedProductRequest{
    seller_id: Number
    buyer_id: Number
    buyer_name: string
    produce_id: Number
    quantity: Number
    starting_point: string
    end_point: string
  }

  export interface PurchasedProduct{
    order_id: Number
    quantity: Number
    timestamp: string
    product_name: string
    product_price: Number
    img_url: string
    status: string //未接單or已接單or已送達or已確認
    unit: string
  }