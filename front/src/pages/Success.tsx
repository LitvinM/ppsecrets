import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Download, CheckCircle, FileText, Clock } from 'lucide-react';
import { api, BASE_URL } from '../api';

export const Success = () => {
    const [searchParams] = useSearchParams();
    const [ppts, setPpts] = useState<any[]>([]);
    const ids = searchParams.get('ids')?.split(',') || [];

    useEffect(() => {
        if (ids.length > 0) {
            fetch(`${BASE_URL}/ppt/list-by-ids?${ids.map(id => `ids=${id}`).join('&')}`)
                .then(res => res.json())
                .then(data => setPpts(data));
        }
    }, []);

    const handleDownload = async (id: string) => {
        try {
            await api.ppt.download(id);
        } catch (e) {
            alert('Оплата еще обрабатывается сервером. Пожалуйста, подождите минуту и обновите страницу, либо проверьте вашу электронную почту.');
        }
    };

    return (
        <div className="flex-grow flex flex-col items-center py-12 px-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-2xl w-full text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h1 className="text-3xl font-bold mb-2">Заказ принят!</h1>
                <p className="text-gray-600 mb-4">Если оплата прошла успешно, файлы будут отправлены вам на почту, а также станут доступны для скачивания здесь.</p>

                <div className="flex items-center justify-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg mb-8 text-sm">
                    <Clock size={16} />
                    <span>Обработка платежа может занять до 1-2 минут.</span>
                </div>

                <div className="space-y-4 mb-8">
                    {ppts.map((ppt) => (
                        <div key={ppt.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-3">
                                <FileText className="text-[#fd2d55]" />
                                <span className="font-medium text-left">{ppt.name}</span>
                            </div>
                            <button
                                onClick={() => handleDownload(ppt.id)}
                                className="bg-[#fd2d55] text-white p-2 rounded-lg hover:bg-opacity-90 transition-all"
                                title="Скачать"
                            >
                                <Download size={20} />
                            </button>
                        </div>
                    ))}
                </div>

                <Link to="/app" className="inline-block bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-all">
                    Вернуться в магазин
                </Link>
            </div>
        </div>
    );
};