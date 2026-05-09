import { useEffect, useState } from 'react'
import { financeAnalyticsApi } from '../api/endpoints'
import { apiCall } from '../hooks/useApi'
import Layout from '../components/Layout'
import LoadingSpinner from '../components/LoadingSpinner'
import { useT } from '../i18n/useT'
import { usePrefs, formatMoney } from '../i18n/store'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts'

interface CategorySpend { category_id: number; name: string; icon?: string; color?: string; total: number }
interface MonthlyTrend { month: string; income: number; expense: number; balance: number }
interface Tip { icon: string; title: string; text: string }

export default function FinanceAnalytics() {
  const t = useT()
  const { currency } = usePrefs()
  const [byCategory, setByCategory] = useState<CategorySpend[]>([])
  const [trends, setTrends] = useState<MonthlyTrend[]>([])
  const [summary, setSummary] = useState<{ month_expense: number; month_income: number; month_balance: number; avg_per_day: number } | null>(null)
  const [tips, setTips] = useState<Tip[]>([])
  const [period, setPeriod] = useState('month')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const [c, tr, s, tp] = await Promise.all([
      apiCall(() => financeAnalyticsApi.spendingByCategory(period)),
      apiCall(() => financeAnalyticsApi.monthlyTrends(6)),
      apiCall(() => financeAnalyticsApi.summary()),
      apiCall(() => financeAnalyticsApi.tips()),
    ])
    if (c) setByCategory(c)
    if (tr) setTrends(tr)
    if (s) setSummary(s)
    if (tp) setTips(tp)
    setLoading(false)
  }

  useEffect(() => { load() }, [period])

  const periodLabels = [
    ['week', t('periodWeek')],
    ['month', t('periodMonth')],
    ['quarter', t('periodQuarter')],
    ['year', t('periodYear')],
  ] as const

  return (
    <Layout>
      <div className="max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{t('financeAnalytics')}</h1>
          <div className="flex gap-2">
            {periodLabels.map(([k, l]) => (
              <button key={k} onClick={() => setPeriod(k)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${period === k ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600'}`}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {loading ? <LoadingSpinner /> : (
          <>
            {summary && (
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow-sm p-5">
                  <p className="text-sm text-gray-500">{t('expense')}</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">{formatMoney(summary.month_expense, currency)}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-5">
                  <p className="text-sm text-gray-500">{t('income')}</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">{formatMoney(summary.month_income, currency)}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-5">
                  <p className="text-sm text-gray-500">{t('balance')}</p>
                  <p className={`text-2xl font-bold mt-1 ${summary.month_balance >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                    {formatMoney(summary.month_balance, currency)}
                  </p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-5">
                  <p className="text-sm text-gray-500">{t('perDay')}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{formatMoney(summary.avg_per_day, currency)}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-xl shadow-sm p-5">
                <h2 className="text-sm font-semibold text-gray-700 mb-4">{t('byCategory')}</h2>
                {byCategory.length === 0 ? (
                  <p className="text-gray-400 text-sm py-8 text-center">{t('noData')}</p>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={byCategory} dataKey="total" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                        {byCategory.map((c, i) => <Cell key={i} fill={c.color || '#6366f1'} />)}
                      </Pie>
                      <Tooltip formatter={(v: number) => formatMoney(v, currency)} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-sm p-5">
                <h2 className="text-sm font-semibold text-gray-700 mb-4">{t('trend6Months')}</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: number) => formatMoney(v, currency)} />
                    <Legend />
                    <Line type="monotone" dataKey="income" stroke="#22c55e" name={t('income')} />
                    <Line type="monotone" dataKey="expense" stroke="#ef4444" name={t('expense')} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">{t('tips')}</h2>
              <div className="grid grid-cols-2 gap-3">
                {tips.map((tip, i) => (
                  <div key={i} className="border border-gray-200 rounded-lg p-4 flex gap-3">
                    <span className="text-2xl">{tip.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-800 mb-1">{tip.title}</p>
                      <p className="text-xs text-gray-500">{tip.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}
