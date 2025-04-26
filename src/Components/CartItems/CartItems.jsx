import React, { useContext } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';
import "./CartItems.css";
import remove_icon from "../../assets/remove.webp";
import { ShopContext } from '../../Context/ShopContext';

// Stripe public key (replace with your actual pk_test_ key)
const stripePromise = loadStripe("pk_test_51R7E3S03ieKIrQzn5lFGjo7rfyJ7EwCIGm9T7aRBf2hLkv3Xr4hhXhDsO3j8uAf1Nn8gEiNvmVy8VIH6dzMoFLFt00YwWhvEZo");

const CartItems = () => {
    const { getTotalCartAmount, all_product, cartItems, removeFromCart } = useContext(ShopContext);

    const handleCheckout = async () => {
        const cartProducts = all_product
            .filter(product => cartItems[product.id] > 0)
            .map(product => ({
                id: product.id,
                name: product.name,
                price: product.new_price,
                quantity: cartItems[product.id],
            }));

        const stripe = await stripePromise;

        try {
            const response = await axios.post("/api/create-checkout-session", {
                cartItems: cartProducts,
            });

            const result = await stripe.redirectToCheckout({
                sessionId: response.data.id,
            });

            if (result.error) {
                alert(result.error.message);
            }
        } catch (error) {
            console.error('Checkout error:', error);
            alert('Something went wrong during checkout.');
        }
    };

    return (
        <div className='cartItems'>
            <div className="cartitems-format-main">
                <p>Products</p>
                <p>Title</p>
                <p>Price</p>
                <p>Quantity</p>
                <p>Total</p>
                <p>Remove</p>
            </div>
            <hr />
            {all_product.map((e) => {
                if (cartItems[e.id] > 0) {
                    return (
                        <div key={e.id}>
                            <div className='cartItems-format cartitems-format-main'>
                                <img src={e.image} alt={e.name} height="100px" />
                                <p>{e.name}</p>
                                <p>${e.new_price}</p>
                                <button className='cartitems-quantity'>
                                    {cartItems[e.id]}
                                </button>
                                <p>${e.new_price * cartItems[e.id]}</p>
                                <img src={remove_icon} alt="Remove Item" onClick={() => removeFromCart(e.id)} height="20px" />
                            </div>
                            <hr />
                        </div>
                    );
                }
                return null;
            })}
            <div className="cartitems-down">
                <div className="cartitems-total">
                    <h1>Cart Totals</h1>
                    <div>
                        <div className="cartitems-total-item">
                            <p>Subtotal</p>
                            <p>${getTotalCartAmount()}</p>
                        </div>
                        <hr />
                        <div className="cartitems-total-item">
                            <p>Shipping Fee</p>
                            <p>Free</p>
                        </div>
                        <hr />
                        <div className="cartitems-total-item">
                            <p>Total</p>
                            <p>${getTotalCartAmount()}</p>
                        </div>
                    </div>
                    <button onClick={handleCheckout}>PROCEED TO CHECKOUT</button>
                </div>
                <div className="cartitems-promocode">
                    <p>If you have a promo code, enter it here</p>
                    <div className="cartitems-promobox">
                        <input type='text' placeholder='Promo code' />
                        <button>Submit</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CartItems;
