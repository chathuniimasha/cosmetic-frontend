import { useEffect, useState } from "react"
import { TbTrash } from "react-icons/tb"
import { useLocation, useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import axios from "axios"

export default function CheckoutPage() {
    const location = useLocation()
    const navigate = useNavigate()

    const [user, setUser] = useState(null)
    const [name, setName] = useState("")
    const [address, setAddress] = useState("")
    const [phone, setPhone] = useState("")

    useEffect(() => {
        const token = localStorage.getItem("token")
        if (token == null) {
            toast.error("Please login to checkout")
            navigate("/login")
            return
        } else {
            axios
                .get(import.meta.env.VITE_BACKEND_URL + "/api/users/", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                .then((res) => {
                    setUser(res.data)
                    setName(res.data.firstName + " " + res.data.lastName)
                })
                .catch((err) => {
                    console.error(err)
                    toast.error("Failed to fetch user details")
                    navigate("/login")
                })
        }
    }, [])

    const [cart, setCart] = useState(location.state.items || [])
    if (location.state.items == null) {
        toast.error("Please select items to checkout")
        navigate("/products")
    }

    function getTotal() {
        let total = 0
        cart.forEach((item) => {
            total += item.quantity * item.price
        })
        return total
    }

    async function placeOrder() {
        const token = localStorage.getItem("token")
        if (token == null) {
            toast.error("Please login to place an order")
            navigate("/login")
            return
        }
        if (name === "" || address === "" || phone === "") {
            toast.error("Please fill all the fields")
            return
        }
        const order = {
            address: address,
            phone: phone,
            items: [],
        }
        cart.forEach((item) => {
            order.items.push({
                productId: item.productId,
                qty: item.quantity,
            })
        })

        try {
            await axios.post(import.meta.env.VITE_BACKEND_URL + "/api/orders", order, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            toast.success("Order placed successfully")
        } catch (err) {
            console.error(err)
            toast.error("Failed to place order")
            return
        }
    }

    return (
        <div className="w-screen max-w-[100vw] h-screen flex flex-col px-2.5 py-10 items-center">
            {cart.map((item, index) => {
                return (
                    <div
                        key={item.productId}
                        className="w-full md:w-200 h-50 md:h-25 m-2.5 shadow-2xl flex flex-row items-center relative"
                    >
                        <div className="md:w-25 w-37.5 justify-center items-center flex flex-col text-1xl md:text-md">
                            <img
                                src={item.image}
                                className="w-25 h-25 object-cover"
                            />
                            <div className="h-full flex-col justify-center pl-2.5 md:hidden flex">
                                <span className="font-bold text-center md:text-left">{item.name}</span>
                                <span className="font-semibold text-center md:text-left">
                                    {item.price.toLocaleString("en-US", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
                                </span>
                            </div>
                        </div>

                        <div className="w-[320px] h-full flex-col justify-center pl-2.5 hidden md:flex">
                            <span className="font-bold text-center md:text-left">{item.name}</span>
                            <span className="font-semibold text-center md:text-left">
                                {item.price.toLocaleString("en-US", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}
                            </span>
                        </div>

                        <div className="w-47.5 h-full text-2xl md:text-md flex flex-row justify-center items-center">
                            <button
                                className="flex justify-center items-center w-7.5 rounded-md bg-accent text-white cursor-pointer hover:accent"
                                onClick={() => {
                                    const newCart = [...cart]
                                    newCart[index].quantity -= 1
                                    if (newCart[index].quantity <= 0) {
                                        newCart.splice(index, 1)
                                    }
                                    setCart(newCart)
                                }}
                            >
                                -
                            </button>
                            <span className="mx-2.5">{item.quantity}</span>
                            <button
                                className="flex justify-center items-center w-7.5 rounded-md bg-accent text-white cursor-pointer hover:accent"
                                onClick={() => {
                                    const newCart = [...cart]
                                    newCart[index].quantity += 1
                                    setCart(newCart)
                                }}
                            >
                                +
                            </button>
                        </div>

                        <div className="w-47.5 h-full text-2xl md:text-md flex items-center justify-end pr-2.5">
                            <span className="font-semibold">
                                {(item.quantity * item.price).toLocaleString("en-US", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}
                            </span>
                        </div>

                        <button
                            className="w-7.5 h-7.5 absolute top-0 right-0 md:top[35px] md:-right-10 cursor-pointer bg-red-700 shadow rounded-full flex justify-center items-center not-last:text-white border-2 border-red-700 hover:bg-white hover:text-red-700"
                            onClick={() => {
                                const newCart = [...cart]
                                newCart.splice(index, 1)
                                setCart(newCart)
                            }}
                        >
                            <TbTrash className="text-xl" />
                        </button>
                    </div>
                )
            })}

            <div className="md:w-200 w-full h-25 m-2.5 p-2.5 shadow-2xl flex flex-row items-center justify-end relative">
                <span className="font-bold text-2xl">
                    Total:{" "}
                    {getTotal().toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    })}
                </span>
                <button
                    onClick={placeOrder}
                    className="absolute left-2.5 md:w-37.5 w-42.5 h-12.5 cursor-pointer rounded-[5px] shadow-2xl bg-accent border-2 border-accent text-white hover:bg-white hover:text-accent text-2xl md:text-md"
                >
                    Place Order
                </button>
            </div>

            <div className="md:w-200 w-full flex flex-col md:flex-row m-2.5 p-2.5 shadow-2xl items-center justify-center gap-2.5">
                <input
                    className="w-[90%] md:w-62.5 h-11.25 border border-gray-300 rounded-[10px] p-2.5"
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <input
                    className="w-[90%] md:w-62.5 h-11.25 border border-gray-300 rounded-[10px] p-2.5"
                    type="text"
                    placeholder="Enter your address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                />
                <input
                    className="w-[90%] md:w-62.5 h-11.25 border border-gray-300 rounded-[10px] p-2.5"
                    type="text"
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                />
            </div>
        </div>
    )
}
