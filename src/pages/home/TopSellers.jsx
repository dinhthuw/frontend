import React, { useState } from 'react';
import { useGetAllBooksQuery } from '../../redux/features/books/booksApi';
import { useFetchAllCategoriesQuery } from '../../redux/features/categories/categoriesApi';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../redux/features/cart/cartSlice';
import { FiShoppingCart, FiFilter } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const TopSellers = () => {
    const { data: books = [], isLoading } = useGetAllBooksQuery();
    const { data: categories = [] } = useFetchAllCategoriesQuery();
    const [selectedCategory, setSelectedCategory] = useState('all');
    const dispatch = useDispatch();

    const filteredBooks = selectedCategory === 'all'
        ? books
        : books.filter(book => book.category?._id === selectedCategory);

    const topBooks = filteredBooks.filter(book => book.trending).slice(0, 6);
    const displayBooks = topBooks.length > 0 ? topBooks : filteredBooks.slice(0, 6);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    const handleAddToCart = (e, book) => {
        e.preventDefault(); // Prevent navigation when clicking the button
        dispatch(addToCart({
            id: book._id,
            title: book.title,
            price: book.newPrice,
            coverImage: book.coverImage,
            quantity: 1
        }));
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold">Top Sellers</h2>
                <div className="flex items-center gap-2">
                    <FiFilter className="text-gray-600" />
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Categories</option>
                        {categories?.map((category) => (
                            <option key={category._id} value={category._id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {displayBooks?.map((book) => (
                    <Link 
                        to={`/books/${book._id}`} 
                        key={book._id}
                        className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                    >
                        <div className="relative group">
                            <img 
                                src={book.coverImage} 
                                alt={book.title}
                                className="w-full h-[300px] object-contain bg-gray-50 p-4"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                                <button 
                                    onClick={(e) => handleAddToCart(e, book)}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2 hover:bg-blue-700"
                                >
                                    <FiShoppingCart />
                                    <span>Add to Cart</span>
                                </button>
                            </div>
                        </div>
                        <div className="p-4">
                            <h3 className="text-lg font-semibold mb-2 line-clamp-2">{book.title}</h3>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-xl font-bold text-red-600">${book.newPrice}</span>
                                    <span className="text-sm text-gray-500 line-through">${book.oldPrice}</span>
                                </div>
                                <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded">
                                    {Math.round(((book.oldPrice - book.newPrice) / book.oldPrice) * 100)}% OFF
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default TopSellers;