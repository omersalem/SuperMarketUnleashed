
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from './Modal';

const AddWorkerModal = ({ isOpen, onClose, onAdd }) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [salary, setSalary] = useState('');
  const [loan, setLoan] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({ name, salary: Number(salary), loan: Number(loan) });
    setName('');
    setSalary('');
    setLoan('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-2xl font-bold mb-4">{t('addWorker')}</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
            {t('name')}
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="salary">
            {t('salary')}
          </label>
          <input
            id="salary"
            type="number"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="loan">
            {t('loan')}
          </label>
          <input
            id="loan"
            type="number"
            value={loan}
            onChange={(e) => setLoan(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            {t('addWorker')}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            {t('cancel')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddWorkerModal;
