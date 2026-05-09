import { useEffect, useState } from 'react'
import { financeApi } from '../api/endpoints'
import { apiCall } from '../hooks/useApi'
import Layout from '../components/Layout'
import LoadingSpinner from '../components/LoadingSpinner'
import { useT } from '../i18n/useT'
import { usePrefs, formatMoney, type Currency } from '../i18n/store'

interface Category { id: number; name: string; icon?: string; color?: string }
interface Account { id: number; name: string; balance: number; account_type: string; currency: string }
interface Tx {
  id: number; amount: number; type: 'income' | 'expense'; transaction_date: string
  description?: string; category_id?: number; account_id?: number
}

export default function Finance() {
  const t = useT()
  const { currency } = usePrefs()
  const [categories, setCategories] = useState<Category[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [transactions, setTransactions] = useState<Tx[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showAccount, setShowAccount] = useState(false)
  const [type, setType] = useState<'expense' | 'income'>('expense')
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState<number | undefined>()
  const [accountId, setAccountId] = useState<number | undefined>()
  const [description, setDescription] = useState('')

  // Account form
  const [accName, setAccName] = useState('')
  const [accType, setAccType] = useState('cash')
  const [accCurrency, setAccCurrency] = useState<Currency>(currency)
  const [accBalance, setAccBalance] = useState('')

  const load = async () => {
    setLoading(true)
    const [cats, accs, txs] = await Promise.all([
      apiCall(() => financeApi.listCategories()),
      apiCall(() => financeApi.listAccounts()),
      apiCall(() => financeApi.listTransactions({ limit: 100 })),
    ])
    if (cats) setCategories(cats)
    if (accs) setAccounts(accs)
    if (txs) setTransactions(txs.items)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const createTransaction = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount) return
    await apiCall(() => financeApi.createTransaction({
      amount: parseFloat(amount), type,
      transaction_date: new Date().toISOString().split('T')[0],
      category_id: categoryId, account_id: accountId,
      description: description || undefined,
    }))
    setAmount(''); setDescription(''); setCategoryId(undefined); setShowForm(false)
    load()
  }

  const createAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!accName.trim()) return
    await apiCall(() => financeApi.createAccount({
      name: accName, account_type: accType, currency: accCurrency,
      balance: accBalance ? parseFloat(accBalance) : 0,
    }))
    setAccName(''); setAccBalance(''); setShowAccount(false)
    load()
  }

  const remove = async (id: number) => {
    await apiCall(() => financeApi.removeTransaction(id))
    load()
  }

  const totalBalance = accounts.reduce((s, a) => s + Number(a.balance), 0)
  const monthExpense = transactions
    .filter(tx => tx.type === 'expense' && tx.transaction_date.startsWith(new Date().toISOString().slice(0, 7)))
    .reduce((s, tx) => s + Number(tx.amount), 0)
  const monthIncome = transactions
    .filter(tx => tx.type === 'income' && tx.transaction_date.startsWith(new Date().toISOString().slice(0, 7)))
    .reduce((s, tx) => s + Number(tx.amount), 0)

  const catMap = Object.fromEntries(categories.map(c => [c.id, c]))

  return (
    <Layout>
      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{t('finance')}</h1>
          <div className="flex gap-2">
            <button onClick={() => setShowAccount(!showAccount)}
              className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
              + {t('newAccount')}
            </button>
            <button onClick={() => setShowForm(!showForm)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
              + {t('newTransaction')}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-5">
            <p className="text-sm text-gray-500">{t('balance')}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{formatMoney(totalBalance, currency)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5">
            <p className="text-sm text-gray-500">{t('income')}</p>
            <p className="text-2xl font-bold text-green-600 mt-1">+{formatMoney(monthIncome, currency)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5">
            <p className="text-sm text-gray-500">{t('expense')}</p>
            <p className="text-2xl font-bold text-red-600 mt-1">−{formatMoney(monthExpense, currency)}</p>
          </div>
        </div>

        {showAccount && (
          <form onSubmit={createAccount} className="bg-white rounded-xl shadow-sm p-5 mb-6 space-y-3">
            <p className="text-sm font-semibold text-gray-700">{t('newAccount')}</p>
            <input value={accName} onChange={e => setAccName(e.target.value)} placeholder={t('accountName')} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            <div className="grid grid-cols-3 gap-3">
              <select value={accType} onChange={e => setAccType(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option value="cash">{t('cash')}</option>
                <option value="card">{t('card')}</option>
                <option value="bank">{t('bank')}</option>
                <option value="credit">{t('credit')}</option>
              </select>
              <select value={accCurrency} onChange={e => setAccCurrency(e.target.value as Currency)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option value="KZT">KZT (₸)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="RUB">RUB (₽)</option>
              </select>
              <input type="number" step="0.01" value={accBalance} onChange={e => setAccBalance(e.target.value)}
                placeholder={t('balance')} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
              {t('add')}
            </button>
          </form>
        )}

        {accounts.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            {accounts.map(a => (
              <div key={a.id} className="bg-white rounded-xl shadow-sm p-4">
                <p className="text-xs text-gray-500">{t(a.account_type as 'cash' | 'card' | 'bank' | 'credit')}</p>
                <p className="text-sm font-medium text-gray-800">{a.name}</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{formatMoney(Number(a.balance), a.currency as Currency)}</p>
              </div>
            ))}
          </div>
        )}

        {showForm && (
          <form onSubmit={createTransaction} className="bg-white rounded-xl shadow-sm p-5 mb-6 space-y-3">
            <div className="flex gap-2">
              <button type="button" onClick={() => setType('expense')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium ${type === 'expense' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                {t('expense')}
              </button>
              <button type="button" onClick={() => setType('income')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium ${type === 'income' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                {t('income')}
              </button>
            </div>
            <input type="number" step="0.01" required value={amount} onChange={e => setAmount(e.target.value)}
              placeholder={t('amount')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <div>
              <p className="text-xs text-gray-500 mb-1.5">{t('category')}</p>
              <div className="flex flex-wrap gap-2">
                {categories.map(c => (
                  <button key={c.id} type="button" onClick={() => setCategoryId(c.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border-2 ${categoryId === c.id ? 'border-indigo-500 bg-indigo-50' : 'border-transparent bg-gray-100'}`}>
                    {c.icon} {c.name}
                  </button>
                ))}
              </div>
            </div>
            {accounts.length > 0 && (
              <select value={accountId || ''} onChange={e => setAccountId(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option value="">— {t('account')} —</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name} ({a.currency})</option>)}
              </select>
            )}
            <input value={description} onChange={e => setDescription(e.target.value)} placeholder={t('description')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
              {t('add')}
            </button>
          </form>
        )}

        {loading ? <LoadingSpinner /> : (
          <div className="bg-white rounded-xl shadow-sm divide-y">
            {transactions.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-12">
                {accounts.length === 0 ? t('noAccounts') : t('noTransactions')}
              </p>
            )}
            {transactions.map(tx => {
              const cat = tx.category_id ? catMap[tx.category_id] : null
              return (
                <div key={tx.id} className="flex items-center px-5 py-3 gap-4">
                  <span className="text-2xl">{cat?.icon || '💵'}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{cat?.name || '—'}</p>
                    {tx.description && <p className="text-xs text-gray-400">{tx.description}</p>}
                    <p className="text-xs text-gray-400">{tx.transaction_date}</p>
                  </div>
                  <span className={`font-semibold ${tx.type === 'income' ? 'text-green-600' : 'text-gray-900'}`}>
                    {tx.type === 'income' ? '+' : '−'}{formatMoney(Number(tx.amount), currency)}
                  </span>
                  <button onClick={() => remove(tx.id)} className="text-gray-300 hover:text-red-400 text-lg">×</button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Layout>
  )
}
