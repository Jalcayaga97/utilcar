import { useMemo, useState } from 'react'
import { Loader2, Send, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { resolveContactForm } from '@/lib/cms/resolvers/contactPageResolver'
import { submitContact } from '@/lib/contact/submitContact'
import { buildContactFormServiceOptions } from '@/lib/services/serviceCatalog'
import { useContactFormEmail } from '@/hooks/useCms'

const inputClass = cn(
  'w-full rounded-button border border-border bg-white px-4 py-3 text-sm text-ink',
  'placeholder:text-ink-subtle',
  'transition-colors duration-200',
  'focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-ink/10',
  'disabled:cursor-not-allowed disabled:opacity-60',
)

function Field({ label, htmlFor, required, children }) {
  if (!label) return <div>{children}</div>

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
  servicio: '',
  consulta: '',
}

export function ContactForm({ form: rawForm, servicios: rawServicios }) {
  const form = useMemo(() => resolveContactForm(rawForm ?? {}), [rawForm])
  const contactEmail = useContactFormEmail()
  const servicios = useMemo(() => {
    const fromProps = (rawServicios ?? []).filter(Boolean)
    return fromProps.length ? fromProps : buildContactFormServiceOptions()
  }, [rawServicios])
  const [formState, setFormState] = useState(initialForm)
  const [status, setStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const update = (field) => (e) => {
    setFormState((prev) => ({ ...prev, [field]: e.target.value }))
    if (status === 'error') setStatus('idle')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMessage('')

    try {
      await submitContact(formState, { to: contactEmail })
      setStatus('success')
      setFormState(initialForm)
    } catch {
      setStatus('error')
      setErrorMessage(form.error)
    }
  }

  const resetForm = () => {
    setStatus('idle')
    setErrorMessage('')
    setFormState(initialForm)
  }

  const fields = form.fields ?? {}

  return (
    <div className="rounded-card border border-border bg-white p-6 shadow-card sm:p-8">
      <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink">
        {form.heading}
      </h2>

      {status === 'success' ? (
        <div className="mt-8 py-8 text-center">
          <p className="text-lg font-semibold text-ink">{form.success?.title ?? ''}</p>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">
            {form.success?.message ?? ''}
          </p>
          <Button type="button" variant="secondary" className="mt-8" onClick={resetForm}>
            {form.success?.resetLabel ?? 'Enviar otra consulta'}
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
            <Field
              label={fields.nombre?.label ?? ''}
              htmlFor="nombre"
              required={fields.nombre?.required}
            >
              <input
                id="nombre"
                name="nombre"
                type="text"
                required
                value={formState.nombre}
                onChange={update('nombre')}
                className={inputClass}
                placeholder={fields.nombre?.placeholder ?? ''}
                disabled={status === 'loading'}
              />
            </Field>
            <Field label={fields.empresa?.label ?? ''} htmlFor="empresa">
              <input
                id="empresa"
                name="empresa"
                type="text"
                value={formState.empresa}
                onChange={update('empresa')}
                className={inputClass}
                placeholder={fields.empresa?.placeholder ?? ''}
                disabled={status === 'loading'}
              />
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label={fields.mail?.label ?? ''}
              htmlFor="mail"
              required={fields.mail?.required}
            >
              <input
                id="mail"
                name="mail"
                type="email"
                required
                value={formState.mail}
                onChange={update('mail')}
                className={inputClass}
                placeholder={fields.mail?.placeholder ?? ''}
                disabled={status === 'loading'}
              />
            </Field>
            <Field label={fields.telefono?.label ?? ''} htmlFor="telefono">
              <input
                id="telefono"
                name="telefono"
                type="tel"
                value={formState.telefono}
                onChange={update('telefono')}
                className={inputClass}
                placeholder={fields.telefono?.placeholder ?? ''}
                disabled={status === 'loading'}
              />
            </Field>
          </div>

          <Field label={fields.servicio?.label ?? ''} htmlFor="servicio">
            <select
              id="servicio"
              name="servicio"
              value={formState.servicio}
              onChange={update('servicio')}
              className={cn(inputClass, 'cursor-pointer')}
              disabled={status === 'loading'}
            >
              <option value="">{fields.servicio?.placeholder ?? ''}</option>
              {servicios.map((servicio) => (
                <option key={servicio} value={servicio}>
                  {servicio}
                </option>
              ))}
            </select>
          </Field>

          <Field
            label={fields.consulta?.label ?? ''}
            htmlFor="consulta"
            required={fields.consulta?.required}
          >
            <textarea
              id="consulta"
              name="consulta"
              rows={5}
              required
              value={formState.consulta}
              onChange={update('consulta')}
              className={cn(inputClass, 'resize-y min-h-[8rem]')}
              placeholder={fields.consulta?.placeholder ?? ''}
              disabled={status === 'loading'}
            />
          </Field>

          <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={status === 'loading'}>
            {status === 'loading' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {form.submit?.loading ?? 'Enviando...'}
              </>
            ) : (
              <>
                {form.submit?.idle ?? 'Enviar consulta'}
                <Send className="h-4 w-4" strokeWidth={1.75} />
              </>
            )}
          </Button>
        </form>
      )}
    </div>
  )
}
