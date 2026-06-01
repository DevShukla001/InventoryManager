from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import Customer, Order, OrderItem, Product
from app.routers.orders import _serialize_order
from app.schemas import CustomerResponse, ProductResponse, QueryResponse

router = APIRouter(prefix="/query", tags=["query"])

EntityType = Literal["product", "customer", "order"]


@router.get("", response_model=QueryResponse)
def query_by_id(
    entity: EntityType = Query(..., description="Entity type: product, customer, or order"),
    id: int = Query(..., gt=0, description="Numeric ID of the record"),
    db: Session = Depends(get_db),
):
    if entity == "product":
        record = db.get(Product, id)
        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with id {id} not found",
            )
        return QueryResponse(entity=entity, id=id, data=ProductResponse.model_validate(record))

    if entity == "customer":
        record = db.get(Customer, id)
        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Customer with id {id} not found",
            )
        return QueryResponse(entity=entity, id=id, data=CustomerResponse.model_validate(record))

    order = (
        db.query(Order)
        .options(joinedload(Order.customer), joinedload(Order.items).joinedload(OrderItem.product))
        .filter(Order.id == id)
        .first()
    )
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with id {id} not found",
        )
    return QueryResponse(entity=entity, id=id, data=_serialize_order(order))
