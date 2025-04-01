import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';
import { useGetAllBooksQuery } from '../../redux/features/books/booksApi';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const Recommened = () => {
    const { data: books = [] } = useGetAllBooksQuery();

    // Lọc sách có trending = true hoặc lấy 6 sách đầu tiên nếu không có sách trending
    const recommendedBooks = books.filter(book => book.trending).slice(0, 6);
    const displayBooks = recommendedBooks.length > 0 ? recommendedBooks : books.slice(0, 6);

    return (
        <div className='py-16'>
            <h2 className='text-3xl font-semibold mb-6'>Recommended for you</h2>

            <Swiper
                slidesPerView={1}
                spaceBetween={30}
                navigation={true}
                breakpoints={{
                    640: {
                        slidesPerView: 2,
                        spaceBetween: 20,
                    },
                    768: {
                        slidesPerView: 3,
                        spaceBetween: 40,
                    },
                    1024: {
                        slidesPerView: 4,
                        spaceBetween: 50,
                    }
                }}
                modules={[Pagination, Navigation]}
                className="mySwiper"
            >
                {displayBooks.length > 0 ? (
                    displayBooks.map((book, index) => (
                        <SwiperSlide key={index}>
                            <div className="bg-white rounded-lg shadow-md overflow-hidden h-full">
                                <img 
                                    src={book.coverImage} 
                                    alt={book.title}
                                    className="w-full h-48 object-cover"
                                />
                                <div className="p-4">
                                    <h3 className="font-semibold text-lg mb-2">{book.title}</h3>
                                    <p className="text-gray-600 text-sm mb-2">{book.description}</p>
                                    <div className="flex justify-between items-center">
                                        <span className="text-red-600 font-bold">${book.newPrice}</span>
                                        <span className="text-gray-500 line-through text-sm">${book.oldPrice}</span>
                                    </div>
                                    <button className="w-full mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))
                ) : (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">No recommended books available</p>
                    </div>
                )}
            </Swiper>
        </div>
    );
};

export default Recommened;