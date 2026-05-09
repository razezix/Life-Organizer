export interface TimezoneOption {
  value: string
  labelEn: string
  labelRu: string
}

export const TIMEZONES: TimezoneOption[] = [
  { value: 'UTC', labelEn: 'UTC (UTC+0)', labelRu: 'UTC (UTC+0)' },
  { value: 'America/Los_Angeles', labelEn: 'Los Angeles (UTC-8)', labelRu: 'Лос-Анджелес (UTC-8)' },
  { value: 'America/Denver', labelEn: 'Denver (UTC-7)', labelRu: 'Денвер (UTC-7)' },
  { value: 'America/Chicago', labelEn: 'Chicago (UTC-6)', labelRu: 'Чикаго (UTC-6)' },
  { value: 'America/New_York', labelEn: 'New York (UTC-5)', labelRu: 'Нью-Йорк (UTC-5)' },
  { value: 'America/Sao_Paulo', labelEn: 'São Paulo (UTC-3)', labelRu: 'Сан-Паулу (UTC-3)' },
  { value: 'Europe/London', labelEn: 'London (UTC+0)', labelRu: 'Лондон (UTC+0)' },
  { value: 'Europe/Paris', labelEn: 'Paris (UTC+1)', labelRu: 'Париж (UTC+1)' },
  { value: 'Europe/Berlin', labelEn: 'Berlin (UTC+1)', labelRu: 'Берлин (UTC+1)' },
  { value: 'Europe/Kyiv', labelEn: 'Kyiv (UTC+2)', labelRu: 'Киев (UTC+2)' },
  { value: 'Europe/Istanbul', labelEn: 'Istanbul (UTC+3)', labelRu: 'Стамбул (UTC+3)' },
  { value: 'Europe/Moscow', labelEn: 'Moscow (UTC+3)', labelRu: 'Москва (UTC+3)' },
  { value: 'Asia/Dubai', labelEn: 'Dubai (UTC+4)', labelRu: 'Дубай (UTC+4)' },
  { value: 'Asia/Karachi', labelEn: 'Karachi (UTC+5)', labelRu: 'Карачи (UTC+5)' },
  { value: 'Asia/Almaty', labelEn: 'Almaty (UTC+5)', labelRu: 'Алматы (UTC+5)' },
  { value: 'Asia/Yekaterinburg', labelEn: 'Yekaterinburg (UTC+5)', labelRu: 'Екатеринбург (UTC+5)' },
  { value: 'Asia/Astana', labelEn: 'Astana (UTC+6)', labelRu: 'Астана (UTC+6)' },
  { value: 'Asia/Bangkok', labelEn: 'Bangkok (UTC+7)', labelRu: 'Бангкок (UTC+7)' },
  { value: 'Asia/Novosibirsk', labelEn: 'Novosibirsk (UTC+7)', labelRu: 'Новосибирск (UTC+7)' },
  { value: 'Asia/Singapore', labelEn: 'Singapore (UTC+8)', labelRu: 'Сингапур (UTC+8)' },
  { value: 'Asia/Shanghai', labelEn: 'Shanghai (UTC+8)', labelRu: 'Шанхай (UTC+8)' },
  { value: 'Asia/Tokyo', labelEn: 'Tokyo (UTC+9)', labelRu: 'Токио (UTC+9)' },
  { value: 'Asia/Vladivostok', labelEn: 'Vladivostok (UTC+10)', labelRu: 'Владивосток (UTC+10)' },
  { value: 'Australia/Sydney', labelEn: 'Sydney (UTC+11)', labelRu: 'Сидней (UTC+11)' },
  { value: 'Pacific/Auckland', labelEn: 'Auckland (UTC+13)', labelRu: 'Окленд (UTC+13)' },
]
