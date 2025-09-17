
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AddWorkerModal from './AddWorkerModal';
import EditWorkerModal from './EditWorkerModal';
import { addWorker, updateWorker, deleteWorker } from '../firebase/firestore';

const WorkerManagement = ({ workers, setWorkers }) => {
  const { t } = useTranslation();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);

  const handleEdit = (worker) => {
    setSelectedWorker(worker);
    setIsEditModalOpen(true);
  };

  const handleAdd = async (worker) => {
    try {
      const newWorker = await addWorker(worker);
      setWorkers([...workers, newWorker]);
    } catch (error) {
      console.error("Error adding worker: ", error);
    }
  };

  const handleUpdate = async (id, worker) => {
    try {
      await updateWorker(id, worker);
      setWorkers(workers.map((w) => (w.id === id ? { id, ...worker } : w)));
    } catch (error) {
      console.error("Error updating worker: ", error);
    }
  };

  const handleDelete = async (workerId) => {
    try {
      await deleteWorker(workerId);
      setWorkers(workers.filter((worker) => worker.id !== workerId));
    } catch (error) {
      console.error("Error deleting worker: ", error);
    }
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t('workerManagement')}</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          {t('addWorker')}
        </button>
      </div>
      <div className="bg-gray-800 shadow-md rounded-lg p-4">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="px-6 py-3 border-b-2 border-gray-700 text-left text-sm leading-4 text-gray-300 uppercase tracking-wider">{t('name')}</th>
              <th className="px-6 py-3 border-b-2 border-gray-700 text-left text-sm leading-4 text-gray-300 uppercase tracking-wider">{t('salary')}</th>
              <th className="px-6 py-3 border-b-2 border-gray-700 text-left text-sm leading-4 text-gray-300 uppercase tracking-wider">{t('loan')}</th>
              <th className="px-6 py-3 border-b-2 border-gray-700"></th>
            </tr>
          </thead>
          <tbody>
            {workers.map((worker) => (
              <tr key={worker.id}>
                <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-700">{worker.name}</td>
                <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-700">{worker.salary}</td>
                <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-700">{worker.loan}</td>
                <td className="px-6 py-4 whitespace-no-wrap text-right border-b border-gray-700 text-sm leading-5 font-medium">
                  <button onClick={() => handleEdit(worker)} className="text-indigo-400 hover:text-indigo-300 mr-4">{t('edit')}</button>
                  <button onClick={() => handleDelete(worker.id)} className="text-red-400 hover:text-red-300">{t('delete')}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AddWorkerModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={handleAdd} />
      {selectedWorker && (
        <EditWorkerModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} worker={selectedWorker} onUpdate={handleUpdate} />
      )}
    </div>
  );
};

export default WorkerManagement;
