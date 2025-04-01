import React, { useState, useEffect } from 'react'
import InputField from './InputField'
import SelectField from './SelectField'
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { HiOutlinePlus } from 'react-icons/hi';
import { useFetchAllCategoriesQuery } from '../../../redux/features/categories/categoriesApi'
import { toast } from 'react-toastify'

const AddBook = () => {
    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: {
            title: '',
            description: '',
            category: '',
            trending: false,
            oldPrice: '',
            newPrice: ''
        },
        mode: 'onChange'
    });
    const [imageFile, setimageFile] = useState(null);
    const [imageFileName, setimageFileName] = useState('')
    const [base64Image, setBase64Image] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const { data: categoriesData = [], isLoading: isCategoriesLoading } = useFetchAllCategoriesQuery();

    const API_URL = 'https://backend-e339.onrender.com';

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            Swal.fire({
                icon: 'warning',
                title: 'Phiên đăng nhập hết hạn',
                text: 'Vui lòng đăng nhập lại để tiếp tục',
                confirmButtonText: 'OK'
            }).then(() => {
                navigate('/admin/login');
            });
            return;
        }
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }, [navigate]);

    const handleAuthError = () => {
        Swal.fire({
            icon: 'error',
            title: 'Lỗi xác thực',
            text: 'Bạn không có quyền truy cập chức năng này. Vui lòng kiểm tra lại quyền của bạn.',
            confirmButtonText: 'Đồng ý'
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        console.log('=== BẮT ĐẦU XỬ LÝ FILE ẢNH ===');
        
        if (!file) {
            console.log('Không có file được chọn');
            return;
        }

        console.log('File đã chọn:', {
            name: file.name,
            type: file.type,
            size: `${(file.size / 1024 / 1024).toFixed(2)}MB`
        });

        if (file.size > 5 * 1024 * 1024) {
            console.log('File quá lớn:', file.size);
            toast.error('Kích thước file quá lớn. Vui lòng chọn file nhỏ hơn 5MB');
            return;
        }

        setimageFile(file);
        setimageFileName(file.name);
        
        const reader = new FileReader();
        
        reader.onloadstart = () => {
            console.log('Bắt đầu đọc file...');
        };
        
        reader.onload = () => {
            console.log('Đọc file thành công');
            const base64String = reader.result;
            console.log('Độ dài base64:', base64String.length);
            console.log('Prefix base64:', base64String.substring(0, 50));
            
            setBase64Image(base64String);
            console.log('Đã lưu base64 vào state');
        };
        
        reader.onerror = (error) => {
            console.error('Lỗi khi đọc file:', error);
            toast.error('Có lỗi khi xử lý file ảnh');
        };
        
        reader.onloadend = () => {
            console.log('=== KẾT THÚC XỬ LÝ FILE ẢNH ===');
        };

        console.log('Bắt đầu chuyển đổi file sang base64...');
        reader.readAsDataURL(file);
    }

    const handleFormSubmit = handleSubmit(async (data) => {
        try {
            console.log('=== BẮT ĐẦU QUÁ TRÌNH GỬI API ===');
            
            const token = localStorage.getItem('token');
            console.log('Token:', token ? 'Đã có token' : 'Chưa có token');

            if (!token) {
                toast.error('Vui lòng đăng nhập lại');
                return;
            }

            if (!base64Image) {
                toast.error('Vui lòng chọn ảnh bìa sách');
                return;
            }

            // Kiểm tra và chuyển đổi giá trị
            const oldPrice = parseInt(data.oldPrice);
            const newPrice = parseInt(data.newPrice);

            if (isNaN(oldPrice) || oldPrice <= 0) {
                toast.error('Giá cũ không hợp lệ');
                return;
            }

            if (isNaN(newPrice) || newPrice <= 0) {
                toast.error('Giá mới không hợp lệ');
                return;
            }

            if (newPrice >= oldPrice) {
                toast.error('Giá mới phải nhỏ hơn giá cũ');
                return;
            }

            // Tạo dữ liệu theo đúng format server yêu cầu
            const bookData = {
                title: data.title.trim(),
                description: data.description.trim(),
                category: data.category,
                oldPrice: oldPrice,
                newPrice: newPrice,
                coverImage: base64Image,
                trending: Boolean(data.trending)
            };

            console.log('=== DỮ LIỆU REQUEST ===');
            console.log('URL:', API_URL);
            console.log('Method:', 'POST');
            console.log('Headers:', {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            });
            console.log('BookData:', {
                ...bookData,
                coverImage: `${bookData.coverImage.substring(0, 50)}... (length: ${bookData.coverImage.length})`
            });

            setIsSubmitting(true);

            const response = await axios.post(API_URL, bookData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('=== PHẢN HỒI TỪ SERVER ===');
            console.log('Status:', response.status);
            console.log('Data:', response.data);

            if (response.data.success) {
                console.log('=== THÊM SÁCH THÀNH CÔNG ===');
                console.log('Book ID:', response.data.book._id);
                toast.success('Thêm sách thành công!');
                reset(); // Reset form using react-hook-form
                setimageFileName('');
                setimageFile(null);
                setBase64Image('');
                navigate('/dashboard/manage-books');
            } else {
                console.log('=== LỖI TỪ SERVER ===');
                console.log('Message:', response.data.message);
                toast.error(response.data.message || 'Không thể thêm sách');
            }
        } catch (error) {
            console.log('=== LỖI KHI GỌI API ===');
            console.log('Tên lỗi:', error.name);
            console.log('Message:', error.message);
            if (error.response) {
                console.log('Status:', error.response.status);
                console.log('Data:', error.response.data);
            }
            
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi thêm sách');
        } finally {
            setIsSubmitting(false);
        }
    });

    if (isCategoriesLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Thêm sách mới</h1>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <form onSubmit={handleFormSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField
                            label="Tiêu đề sách"
                            name="title"
                            placeholder="Nhập tiêu đề sách"
                            register={register}
                            error={errors.title?.message}
                            required
                        />

                        <InputField
                            label="Mô tả sách"
                            name="description"
                            placeholder="Nhập mô tả sách"
                            type="textarea"
                            register={register}
                            error={errors.description?.message}
                            required
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Danh mục</label>
                            <select
                                {...register('category', { 
                                    required: 'Vui lòng chọn danh mục',
                                    validate: value => value !== '' || 'Vui lòng chọn danh mục'
                                })}
                                className={`mt-1 block w-full rounded-md shadow-sm ${
                                    errors.category ? 'border-red-500' : 'border-gray-300'
                                } focus:border-blue-500 focus:ring-blue-500`}
                            >
                                <option value="" key="default">Chọn danh mục</option>
                                {categoriesData.map((category) => (
                                    <option key={category._id} value={category._id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                            {errors.category && (
                                <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                            )}
                        </div>

                        <div className="md:col-span-2">
                            <label className="inline-flex items-center">
                                <input
                                    type="checkbox"
                                    {...register('trending')}
                                    defaultChecked={false}
                                    className="rounded text-blue-600 focus:ring focus:ring-offset-2 focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm font-semibold text-gray-700">Sách nổi bật</span>
                            </label>
                        </div>

                        <InputField
                            label="Giá cũ"
                            name="oldPrice"
                            type="number"
                            placeholder="Nhập giá cũ"
                            register={register}
                            error={errors.oldPrice?.message}
                            required
                            min="0"
                            step="1"
                        />

                        <InputField
                            label="Giá mới"
                            name="newPrice"
                            type="number"
                            placeholder="Nhập giá mới"
                            register={register}
                            error={errors.newPrice?.message}
                            required
                            min="0"
                            step="1"
                        />

                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Ảnh bìa sách</label>
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleFileChange} 
                                className="mb-2 w-full p-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500" 
                            />
                            {imageFileName && (
                                <p className="text-sm text-gray-500">Đã chọn: {imageFileName}</p>
                            )}
                        </div>
                    </div>

                    <div className="mt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center ${
                                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                                    Đang xử lý...
                                </>
                            ) : (
                                <>
                                    <HiOutlinePlus className="h-5 w-5 mr-2" />
                                    Thêm sách mới
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default AddBook
