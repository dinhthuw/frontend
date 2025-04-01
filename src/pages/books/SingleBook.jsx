import React from 'react'
import { FiShoppingCart } from "react-icons/fi"
import { useParams } from "react-router-dom"
import { useDispatch } from 'react-redux';
import { addToCart } from '../../redux/features/cart/cartSlice';
import { useGetSingleBookQuery } from '../../redux/features/books/booksApi';

const SingleBook = () => {
    const {id} = useParams();
    const {data: book, isLoading, error} = useGetSingleBookQuery(id);
    const dispatch = useDispatch();

    const handleAddToCart = (product) => {
        dispatch(addToCart(product))
    }

    if(isLoading) return <div>Loading...</div>
    if(error) return <div>Error: {error.message}</div>
    if(!book) return <div>Book not found</div>

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <img 
                        src={book.coverImage} 
                        alt={book.title}
                        className="w-full rounded-lg shadow-lg"
                    />
                </div>
                <div>
                    <h1 className="text-3xl font-bold mb-4">{book.title}</h1>
                    <p className="text-gray-600 mb-4">{book.description}</p>
                    <div className="flex items-center mb-4">
                        <span className="text-red-600 font-bold text-2xl">${book.newPrice}</span>
                        <span className="text-gray-500 line-through ml-2">${book.oldPrice}</span>
                    </div>
                    <button onClick={() => handleAddToCart(book)} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    )
}

export default SingleBook