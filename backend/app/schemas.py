from datetime import datetime
from decimal import Decimal
from typing import Annotated, Literal, Union

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class ProductBase(BaseModel):
    name: Annotated[str, Field(min_length=1, max_length=255)]
    sku: Annotated[str, Field(min_length=1, max_length=100)]
    price: Annotated[Decimal, Field(gt=0)]
    quantity_in_stock: Annotated[int, Field(ge=0)]


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Annotated[str | None, Field(default=None, min_length=1, max_length=255)] = None
    sku: Annotated[str | None, Field(default=None, min_length=1, max_length=100)] = None
    price: Annotated[Decimal | None, Field(default=None, gt=0)] = None
    quantity_in_stock: Annotated[int | None, Field(default=None, ge=0)] = None


class ProductResponse(ProductBase):
    model_config = ConfigDict(from_attributes=True)

    id: int


class CustomerBase(BaseModel):
    full_name: Annotated[str, Field(min_length=1, max_length=255)]
    email: EmailStr
    phone_number: Annotated[str, Field(min_length=5, max_length=50)]


class CustomerCreate(CustomerBase):
    pass


class CustomerResponse(CustomerBase):
    model_config = ConfigDict(from_attributes=True)

    id: int


class OrderItemCreate(BaseModel):
    product_id: int = Field(gt=0)
    quantity: int = Field(gt=0)


class OrderCreate(BaseModel):
    customer_id: int = Field(gt=0)
    items: list[OrderItemCreate] = Field(min_length=1)

    @field_validator("items")
    @classmethod
    def validate_unique_products(cls, items: list[OrderItemCreate]) -> list[OrderItemCreate]:
        product_ids = [item.product_id for item in items]
        if len(product_ids) != len(set(product_ids)):
            raise ValueError("Duplicate products in the same order are not allowed")
        return items


class OrderItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    product_name: str
    quantity: int
    unit_price: Decimal
    line_total: Decimal


class OrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    customer_id: int
    customer_name: str
    total_amount: Decimal
    created_at: datetime
    items: list[OrderItemResponse]


class DashboardStats(BaseModel):
    total_products: int
    total_customers: int
    total_orders: int
    low_stock_products: list[ProductResponse]


class QueryResponse(BaseModel):
    entity: Literal["product", "customer", "order"]
    id: int
    data: Union[ProductResponse, CustomerResponse, OrderResponse]
