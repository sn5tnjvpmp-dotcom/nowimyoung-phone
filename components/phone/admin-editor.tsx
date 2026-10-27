'use client'

import { useEffect, useState } from 'react'
import { contacts as originalContacts } from '@/lib/story/contacts'

type ContactEdit = {
  name?: string
  initial?: string
  color?: string
  photo?: string
}

type EditData = {
  contacts?: Record<string, ContactEdit>
}

export default function AdminEditor() {
  const [open, setOpen] = useState(false)
  const [unlocked, setUnlocked] = useState(false)
  const [password, setPassword] = useState('')
  const [data, setData] = useState<EditData>({})
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/phone-edits')
      .then(async (res) => {
        if (!res.ok) throw new Error('โหลดข้อมูลไม่สำเร็จ')
        return res.json()
      })
      .then((result) => setData(result.data ?? {}))
      .catch(() => setError('โหลดข้อมูลไม่สำเร็จ กรุณารีเฟรชหน้าเว็บ'))
  }, [])

  const contactEntries = Object.entries(originalContacts)

  function updateContact(
    id: string,
    field: keyof ContactEdit,
    value: string,
  ) {
    setData((previous) => ({
      ...previous,
      contacts: {
        ...previous.contacts,
        [id]: {
          ...previous.contacts?.[id],
          [field]: value,
        },
      },
    }))
    setMessage('')
  }

  async function saveChanges() {
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/phone-edits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, data }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          response.status === 401
            ? 'รหัสผ่านไม่ถูกต้อง'
            : result.error || 'บันทึกไม่สำเร็จ',
        )
      }

      setMessage('บันทึกแล้ว! ข้อมูลถูกเก็บไว้ในฐานข้อมูล')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="absolute bottom-4 right-4 z-[100] rounded-full bg-black/80 px-4 py-3 text-sm text-white shadow-lg"
      >
        ⚙️ Edit
      </button>

      {open && (
        <div className="absolute inset-0 z-[110] overflow-y-auto bg-white p-4 text-black">
          <div className="mx-auto max-w-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">iPhone Editor</h2>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg bg-gray-200 px-3 py-2"
              >
                ปิด ✕
              </button>
            </div>

            {!unlocked ? (
              <div className="rounded-xl border p-4">
                <p className="mb-3 text-sm">
                  ใส่รหัสผ่านเจ้าของเว็บเพื่อแก้ไขข้อมูล
                </p>

                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="รหัสผ่านเจ้าของเว็บ"
                  className="mb-3 w-full rounded-lg border p-3"
                />

                <button
                  onClick={() => {
                    if (!password) {
                      setError('กรุณาใส่รหัสผ่าน')
                      return
                    }
                    setUnlocked(true)
                    setError('')
                  }}
                  className="w-full rounded-lg bg-black p-3 text-white"
                >
                  เข้าสู่โหมดแก้ไข
                </button>
              </div>
            ) : (
              <>
                <p className="mb-4 text-sm text-gray-600">
                  แก้ชื่อและข้อมูลผู้ติดต่อ จากนั้นกดบันทึก
                </p>

                {contactEntries.map(([id, contact]) => {
                  const edit = data.contacts?.[id] ?? {}

                  return (
                    <div
                      key={id}
                      className="mb-4 rounded-xl border p-3"
                    >
                      <p className="mb-2 text-xs text-gray-500">
                        ID: {id}
                      </p>

                      <label className="mb-1 block text-sm">
                        ชื่อผู้ติดต่อ
                      </label>
                      <input
                        value={edit.name ?? contact.name}
                        onChange={(event) =>
                          updateContact(id, 'name', event.target.value)
                        }
                        className="mb-3 w-full rounded-lg border p-2"
                      />

                      <label className="mb-1 block text-sm">
                        ตัวอักษรแทนรูป
                      </label>
                      <input
                        value={edit.initial ?? contact.initial}
                        onChange={(event) =>
                          updateContact(id, 'initial', event.target.value)
                        }
                        className="mb-3 w-full rounded-lg border p-2"
                      />

                      <label className="mb-1 block text-sm">
                        สีประจำผู้ติดต่อ
                      </label>
                      <input
                        value={edit.color ?? contact.color}
                        onChange={(event) =>
                          updateContact(id, 'color', event.target.value)
                        }
                        placeholder="#888888"
                        className="mb-3 w-full rounded-lg border p-2"
                      />

                      <label className="mb-1 block text-sm">
                        URL รูปโปรไฟล์ (ถ้ามี)
                      </label>
                      <input
                        value={edit.photo ?? contact.photo ?? ''}
                        onChange={(event) =>
                          updateContact(id, 'photo', event.target.value)
                        }
                        placeholder="https://..."
                        className="w-full rounded-lg border p-2"
                      />
                    </div>
                  )
                })}

                <button
                  onClick={saveChanges}
                  disabled={loading}
                  className="w-full rounded-xl bg-black p-4 font-semibold text-white disabled:opacity-50"
                >
                  {loading ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
                </button>
              </>
            )}

            {error && (
              <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </p>
            )}

            {message && (
              <p className="mt-3 rounded-lg bg-green-50 p-3 text-sm text-green-700">
                {message}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  )
}
