import { useState } from 'react'
import { Loader2, Send, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { CONTACTO_SERVICIOS } from '@/data/contacto'
import { submitContact } from '@/lib/contact/submitContact'

const inputClass = cn(
  'w-full rounded-button border border-border bg-white px-4 py-3 text-sm text-ink',
  'placeholder:text-ink-subtle',
  'transition-colors duration-200',
  'focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-ink/10',
  'disabled:cursor-not-allowed disabled:opacity-60',
)

function Field({ label, htmlFor, required, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-2 block text-sm font-medium text-ink">
        {label}
        {required && <span className="text-ink-subtle"> *</span>}
      </label>
      {children}
    </div>
  )
}

const initialForm = {
  nombre: '',
  empresa: '',
  mail: '',
  telefono: '',
  fax: '',
  servicio: '',
  consulta: '',
}

export function ContactForm() {
  const [form, setForm] = useState(initialForm)
  const [status, setStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const update = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    if (status === 'error') setStatus('idle')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMessage('')

    try {
      await submitContact(form)
      setStatus('success')
      setForm(initialForm)
    } catch {
      setStatus('error')
      setErrorMessage(
        'No pudimos enviar su consulta en este momento. Intente nuevamente o contáctenos por teléfono o WhatsApp.',
      )
    }
  }

  const resetForm = () => {
    setStatus('idle')
    setErrorMessage('')
    setForm(initialForm)
  }

  return (
    <div className="rounded-card border border-border bg-white p-6 shadow-card sm:p-8">
      <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink">
        Ingrese los datos y nos contactaremos a la brevedad
      </h2>

      {status === 'success' ? (
        <div className="mt-8 py-8 text-center">
          <p className="text-lg font-semibold text-ink">Consulta enviada</p>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">
            Gracias por contactarnos. Revisaremos su mensaje y le responderemos a la brevedad.
          </p>
          <Button type="button" variant="secondary" className="mt-8" onClick={resetForm}>
            Enviar otra consulta
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
          {status === 'error' && errorMessage && (
            <div
              role="alert"
              className="flex gap-3 rounded-lg border border-border bg-surface px-4 py-3 text-sm text-ink-muted"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-ink" strokeWidth={1.75} />
              {errorMessage}
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Nombre" htmlFor="nombre" required>
              <input
                id="nombre"
                name="nombre"
                type="text"
                required
                value={form.nombre}
                onChange={update('nombre')}
                className={inputClass}
                placeholder="Su nombre"
                disabled={status === 'loading'}
              />
            </Field>
            <Field label="Empresa" htmlFor="empresa">
              <input
                id="empresa"
                name="empresa"
                type="text"
                value={form.empresa}
                onChange={update('empresa')}
                className={inputClass}
                placeholder="Opcional"
                disabled={status === 'loading'}
              />
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Mail" htmlFor="mail" required>
              <input
                id="mail"
                name="mail"
                type="email"
                required
                value={form.mail}
                onChange={update('mail')}
                className={inputClass}
                placeholder="correo@empresa.cl"
                disabled={status === 'loading'}
              />
            </Field>
            <Field label="Teléfono" htmlFor="telefono">
              <input
                id="telefono"
                name="telefono"
                type="tel"
                value={form.telefono}
                onChange={update('telefono')}
                className={inputClass}
                placeholder="+56 9 ..."
                disabled={status === 'loading'}
              />
            </Field>
          </div>

          <Field label="Fax" htmlFor="fax">
            <input
              id="fax"
              name="fax"
              type="tel"
              value={form.fax}
              onChange={update('fax')}
              className={inputClass}
              placeholder="Opcional"
              disabled={status === 'loading'}
            />
          </Field>

          <Field label="Servicio de interés" htmlFor="servicio">
            <select
              id="servicio"
              name="servicio"
              value={form.servicio}
              onChange={update('servicio')}
              className={cn(inputClass, 'cursor-pointer')}
              disabled={status === 'loading'}
            >
              <option value="">Seleccionar servicio...</option>
              {CONTACTO_SERVICIOS.map((servicio) => (
                <option key={servicio} value={servicio}>
                  {servicio}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Consulta" htmlFor="consulta" required>
            <textarea
              id="consulta"
              name="consulta"
              rows={5}
              required
              value={form.consulta}
              onChange={update('consulta')}
              className={cn(inputClass, 'resize-y min-h-[8rem]')}
              placeholder="Describa su vehículo, necesidad de conversión o equipamiento..."
              disabled={status === 'loading'}
            />
          </Field>

          <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={status === 'loading'}>
            {status === 'loading' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                Enviar consulta
                <Send className="h-4 w-4" strokeWidth={1.75} />
              </>
            )}
          </Button>
        </form>
      )}
    </div>
  )
}
