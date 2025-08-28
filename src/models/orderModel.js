export const defaultOrder = {
  orderId: "",
  customerId: "",
  restaurantId: "",
  items: [
    {
      productId: "",
      name: "",
      price: 0,
      quantity: 1
    }
  ],
  total: 0,
  orderType: "delivery",
  status: "placed", // incoming  - preparing - ready- delivered / cancel
  history: [
    { status: "placed", timestamp: Date.now() }
  ],
  placedAt: Date.now(),
  updatedAt: Date.now()
};
