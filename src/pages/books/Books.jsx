import React from 'react'
import { useGetAllBooksQuery } from '../../redux/features/books/booksApi'
import BookCard from '../../components/BookCard'

const Books = () => {
    const { data: books = [], isLoading } = useGetAllBooksQuery()

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="py-16">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-bold mb-8">Tất cả sách</h1>
                
                {books.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {books.map((book) => (
                            <BookCard key={book._id} book={book} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">Không tìm thấy sách nào</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Books 