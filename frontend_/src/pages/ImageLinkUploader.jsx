import React, { useState } from 'react';
import axios from '../config/axios';
import SamoletLogo from "../svg/SamoletLogo";

const ImageLinkUploader = () => {
    const [image, setImage] = useState(null);
    const [links, setLinks] = useState([]);
    const [newLink, setNewLink] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [renderImages, setRenderImages] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const furnitureCategories = [
        'Диван',
        'Кресло',
        'Стол',
        'Стул',
        'Шкаф',
        'Кровать',
        'Комод',
        'Полка',
        'Тумба',
    ];

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file && ['image/png', 'image/jpeg'].includes(file.type)) {
            const reader = new FileReader();
            reader.onload = (e) => setImage(e.target.result);
            reader.readAsDataURL(file);
        } else {
            alert('Please upload a PNG or JPG image.');
        }
    };

    const handleAddLink = () => {
        if (newLink.trim() && /^https?:\/\/.*/.test(newLink)) {
            setIsModalOpen(true);
        } else {
            alert('Please enter a valid URL starting with http:// or https://');
        }
    };

    const handleConfirmLink = () => {
        if (selectedCategory) {
            setLinks([...links, { url: newLink, category: selectedCategory }]);
            setNewLink('');
            setSelectedCategory('');
            setSearchQuery('');
            setIsModalOpen(false);
        } else {
            alert('Please select a furniture category.');
        }
    };

    const handleCancelLink = () => {
        setNewLink('');
        setSelectedCategory('');
        setSearchQuery('');
        setIsModalOpen(false);
    };

    const handleRemoveLink = (index) => {
        setLinks(links.filter((_, i) => i !== index));
    };

    const handleCopyLinks = () => {
        const jsonLinks = JSON.stringify(links, null, 2);
        navigator.clipboard.writeText(jsonLinks).then(() => {
            alert('Links copied to clipboard as JSON!');
        }).catch(() => {
            alert('Failed to copy links.');
        });
    };

    const handleRender = async () => {
        if (!image || links.length === 0) {
            alert('Please upload an image and add at least one link.');
            return;
        }

        setIsLoading(true);
        try {
            // Convert the image from base64 back to a file
            const base64Response = await fetch(image);
            const imageBlob = await base64Response.blob();
            const imageFile = new File([imageBlob], "uploaded_image.jpg", { type: "image/jpeg" });
            
            // Create a FormData object for multipart/form-data upload
            const formData = new FormData();
            formData.append('plan_img', imageFile);
            
            // Convert links array to name_to_link object format expected by backend
            const nameToLinkObj = {};
            links.forEach((link) => {
                nameToLinkObj[link.category] = link.url;
            });
            
            // Add the links as a JSON string
            formData.append('links', JSON.stringify(nameToLinkObj));
            
            // Use the configured Axios instance
            const response = await axios.post('/api/v1/collage', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            console.log('Response data:', response.data);
            
            // Check the format of the images in the response
            if (response.data && response.data.images) {
                setRenderImages(response.data.images);
                setCurrentImageIndex(0);
                console.log('Images loaded:', response.data.images.length);
                // Log each image to debug
                response.data.images.forEach((img, idx) => {
                    console.log(`Image ${idx+1} length:`, img.substring(0, 50) + '...');
                });
            } else if (Array.isArray(response.data)) {
                // Handle case where response data is directly the array of images
                setRenderImages(response.data);
                setCurrentImageIndex(0);
                console.log('Images loaded (array):', response.data.length);
                // Log each image to debug
                response.data.forEach((img, idx) => {
                    console.log(`Image ${idx+1} length:`, img.substring(0, 50) + '...');
                });
            } else {
                console.error('Unexpected response format:', response.data);
                alert('Received an unexpected response format. Please try again.');
            }
        } catch (error) {
            console.error('Render request failed:', error);
            
            // More detailed error logging
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.error('Error response data:', error.response.data);
                console.error('Error response status:', error.response.status);
                console.error('Error response headers:', error.response.headers);
                alert(`Failed to generate render. Server error: ${error.response.status}`);
            } else if (error.request) {
                // The request was made but no response was received
                console.error('Error request:', error.request);
                alert('Failed to generate render. No response received from server.');
            } else {
                // Something happened in setting up the request that triggered an Error
                console.error('Error message:', error.message);
                alert(`Failed to generate render: ${error.message}`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrevImage = () => {
        setCurrentImageIndex((prev) => (prev === 0 ? renderImages.length - 1 : prev - 1));
    };

    const handleNextImage = () => {
        setCurrentImageIndex((prev) => (prev === renderImages.length - 1 ? 0 : prev + 1));
    };

    const filteredCategories = furnitureCategories.filter((category) =>
        category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="sticky top-0 bg-white shadow-md z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="text-2xl font-bold text-gray-800">
                        <SamoletLogo />
                    </div>
                    <nav className="hidden md:flex space-x-8">
                        <a href="#" className="text-gray-600 hover:text-[#007BFC] transition">
                            Каталог
                        </a>
                        <a href="#" className="text-gray-600 hover:text-[#007BFC] transition">
                            О нас
                        </a>
                        <a href="#" className="text-gray-600 hover:text-[#007BFC] transition">
                            Контакты
                        </a>
                    </nav>
                    <div className="hidden md:block">
                        <button className="py-2 px-4 bg-[#007BFC] text-white rounded-lg hover:bg-[#005BB5] transition">
                            Личный кабинет
                        </button>
                    </div>
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-gray-600 hover:text-[#007BFC] focus:outline-none"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d={isMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                                />
                            </svg>
                        </button>
                    </div>
                </div>
                {isMenuOpen && (
                    <div className="md:hidden bg-white px-4 py-4 shadow-md">
                        <nav className="flex flex-col space-y-4">
                            <a href="#" className="text-gray-600 hover:text-[#007BFC] transition">
                                Каталог
                            </a>
                            <a href="#" className="text-gray-600 hover:text-[#007BFC] transition">
                                О нас
                            </a>
                            <a href="#" className="text-gray-600 hover:text-[#007BFC] transition">
                                Контакты
                            </a>
                            <button className="py-2 px-4 bg-[#007BFC] text-white rounded-lg hover:bg-[#005BB5] transition">
                                Личный кабинет
                            </button>
                        </nav>
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main className="max-w-lg mx-auto p-6 bg-white rounded-xl shadow-lg mt-6">
                <h1 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
                    Генератор коллажей
                </h1>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Загрузите планировку (PNG/JPG)
                    </label>
                    <div className="flex items-center gap-4">
                        <input
                            type="file"
                            accept="image/png,image/jpeg"
                            onChange={handleImageUpload}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#007BFC]/10 file:text-[#007BFC] hover:file:bg-[#007BFC]/20"
                        />
                        {image && (
                            <div className="flex-shrink-0">
                                <img
                                    src={image}
                                    alt="Uploaded"
                                    className="w-16 h-16 object-cover rounded-md border border-gray-200"
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Добавьте ссылки на предметы интерьера
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newLink}
                            onChange={(e) => setNewLink(e.target.value)}
                            placeholder="https://example.com/furniture"
                            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007BFC] transition"
                            onKeyPress={(e) => e.key === 'Enter' && handleAddLink()}
                        />
                        <button
                            onClick={handleAddLink}
                            className="py-3 px-6 bg-[#007BFC] text-white rounded-lg hover:bg-[#005BB5] transition"
                        >
                            Добавить
                        </button>
                    </div>
                </div>

                {links.length > 0 && (
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="text-lg font-medium text-gray-700">
                                Ссылки на мебель ({links.length})
                            </h2>
                            {/* <button
                onClick={handleCopyLinks}
                className="text-sm text-[#007BFC] hover:text-[#005BB5] underline"
              >
                Copy as JSON
              </button> */}
                        </div>
                        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-3 bg-gray-50 rounded-lg">
                            {links.map((link, index) => (
                                <div
                                    key={index}
                                    className="flex items-center bg-[#007BFC]/10 text-[#007BFC] text-sm font-medium px-3 py-1 rounded-full transition transform hover:scale-105"
                                >
                                    <span className="mr-2">{link.category}:</span>
                                    <a
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="truncate max-w-[200px] hover:underline"
                                    >
                                        {link.url}
                                    </a>
                                    <button
                                        onClick={() => handleRemoveLink(index)}
                                        className="ml-2 text-red-500 hover:text-red-700"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mb-6">
                    <button
                        onClick={handleRender}
                        disabled={isLoading}
                        className={`w-full py-3 px-6 rounded-lg text-white transition ${
                            isLoading ? 'bg-[#4B9EFF] cursor-not-allowed' : 'bg-[#007BFC] hover:bg-[#005BB5]'
                        }`}
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center">
                <svg
                    className="animate-spin h-5 w-5 mr-2 text-white"
                    viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Processing...
              </span>
                        ) : (
                            'Сделать рендер'
                        )}
                    </button>
                </div>

                {renderImages.length > 0 && (
                    <div className="mb-6">
                        <h2 className="text-lg font-medium text-gray-700 mb-3">
                            Сгенерированные коллажи ({renderImages.length} изображений)
                        </h2>
                        <div className="relative">
                            <div className="flex items-center justify-center">
                                <img
                                    src={`data:image/png;base64,${renderImages[currentImageIndex]}`}
                                    alt={`Render ${currentImageIndex + 1}`}
                                    className="w-full h-64 object-contain rounded-lg"
                                />
                            </div>
                            {renderImages.length > 1 && (
                                <>
                                    <button
                                        onClick={handlePrevImage}
                                        className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={handleNextImage}
                                        className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                    <div className="text-center mt-4">
                                        <div className="text-sm text-gray-600 mb-2">
                                            {currentImageIndex + 1} / {renderImages.length}
                                        </div>
                                        <div className="flex justify-center gap-2">
                                            <button 
                                                onClick={handlePrevImage}
                                                className="py-1 px-3 bg-[#007BFC] text-white rounded-lg hover:bg-[#005BB5] transition"
                                            >
                                                Previous Image
                                            </button>
                                            <button 
                                                onClick={handleNextImage}
                                                className="py-1 px-3 bg-[#007BFC] text-white rounded-lg hover:bg-[#005BB5] transition"
                                            >
                                                Next Image
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </main>

            {/* Modal for Category Selection */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md h-[400px] flex flex-col">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">
                            Выберите категорию мебели
                        </h2>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Поиск категорий..."
                            className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007BFC] transition"
                        />
                        <div className="flex-1 max-h-64 overflow-y-auto mb-4">
                            {filteredCategories.length > 0 ? (
                                filteredCategories.map((category) => (
                                    <div
                                        key={category}
                                        onClick={() => setSelectedCategory(category)}
                                        className={`p-3 cursor-pointer rounded-lg transition ${
                                            selectedCategory === category
                                                ? 'bg-[#007BFC]/10 text-[#007BFC]'
                                                : 'hover:bg-gray-100'
                                        }`}
                                    >
                                        {category}
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-center py-3">Категории не найдены</p>
                            )}
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={handleCancelLink}
                                className="py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={handleConfirmLink}
                                className="py-2 px-4 bg-[#007BFC] text-white rounded-lg hover:bg-[#005BB5] transition"
                            >
                                Подтвердить
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageLinkUploader;
