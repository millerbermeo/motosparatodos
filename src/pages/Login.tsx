import React, { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react";
import useLogin from "../services/authServices";
import { useNavigate } from "react-router-dom";

interface LoginRequest {
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>({
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: { username: "", password: "" },
  });
  const navigate = useNavigate();                 // 👈

  const [showPassword, setShowPassword] = useState(false);
  const { mutate, isPending, isError, error } = useLogin();

  const onSubmit: SubmitHandler<LoginRequest> = (data) => {
    mutate(data, {
      onSuccess: () => {
        // navega al home y reemplaza para que no vuelva al login al darle atrás
        navigate("/usuarios");        // 👈
      },
    });
  };

  return (
    <main className="h-screen max-h-screen overflow-hidden w-full bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200">
      <div className="pointer-events-none absolute -top-24 -left-24 size-72 rounded-full bg-sky-500/50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-0 -right-0 size-72 rounded-full bg-red-400/50 blur-3xl" />
      <div className="mx-auto grid min-h-svh max-w-7xl grid-cols-1 lg:grid-cols-2">
        {/* Panel visual izquierdo */}
        <aside className="relative hidden items-center justify-center overflow-hidden lg:flex">
          <img
            src="/moto3.png"
            alt="Motos Para Todos"
            className="pointer-events-none select-none h-[75%] w-[75%] rounded-[2.5rem] object-cover "
          />
          {/* Decoraciones */}

        </aside>

        {/* Panel de formulario derecho */}
        <section className="flex items-center justify-center p-6 sm:p-8 lg:p-12">


          <form
            onSubmit={handleSubmit(onSubmit)}
            className="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-xl ring-1 ring-black/5"
            aria-describedby="form-status"
            noValidate
          >
          <div className="avatar absolute -top-10 z-50 left-1/2 -translate-x-1/2">
          <div className="ring-gray-700 ring-offset-base-100 w-18 rounded-full ring-2 ring-offset-2">
            <img src="/moto3.png" />
          </div>
        </div>


            <header className="mb-6 text-center pt-5">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                Motos Para Todos
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Inicia sesión para continuar
              </p>
            </header>

            {/* Username */}
            <div className="mb-4">
              <label
                htmlFor="username"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Usuario
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="size-4 text-slate-400" aria-hidden="true" />
                </span>
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  placeholder="username"
                  className="block w-full rounded-2xl border border-slate-200 bg-white px-10 py-3 text-slate-900 outline-none transition focus:border-transparent focus:ring-2 focus:ring-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
                  aria-invalid={!!errors.username}
                  {...register("username", {
                    required: "El nombre de usuario es obligatorio",
                    pattern: {
                      value: /^[a-zA-Z0-9_]{3,16}$/, // letras, números y guiones bajos, de 3 a 16 caracteres
                      message: "El nombre de usuario solo puede contener letras, números y guiones bajos (3-16 caracteres)",
                    },
                  })}

                />
              </div>
              {errors.username && (
                <p className="mt-2 text-sm text-rose-600" role="alert">
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="mb-2">
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Contraseña
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="size-4 text-slate-400" aria-hidden="true" />
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Tu contraseña"
                  className="block w-full rounded-2xl border border-slate-200 bg-white px-10 py-3 text-slate-900 outline-none transition focus:border-transparent focus:ring-2 focus:ring-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
                  aria-invalid={!!errors.password}
                  {...register("password", {
                    required: "La contraseña es obligatoria",
                    minLength: { value: 3, message: "Mínimo 6 caracteres" },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 mr-2 flex items-center rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? (
                    <EyeOff className="size-5" aria-hidden="true" />
                  ) : (
                    <Eye className="size-5" aria-hidden="true" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-rose-600" role="alert">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Extra actions */}
            <div className="mb-6 mt-3 flex items-center justify-between gap-3 text-sm">
              <label className="inline-flex select-none items-center gap-2 text-slate-600">
                <input
                  type="checkbox"
                  className="size-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                />
                Recuérdame
              </label>
              <a
                href="#/forgot-password"
                className="font-medium text-cyan-700 underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-3 font-semibold text-white shadow-lg transition enabled:hover:from-cyan-500 enabled:hover:to-blue-500 enabled:active:scale-[.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-5 animate-spin" aria-hidden="true" />
                  Iniciando…
                </>
              ) : (
                <>Iniciar sesión</>
              )}
            </button>

            {/* Mensajes de estado */}
            <div id="form-status" className="mt-4 min-h-6" aria-live="polite">
              {isError && (
                <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-inset ring-rose-200">
                  {error?.message ?? "Ocurrió un error. Intenta nuevamente."}
                </p>
              )}
            </div>

            {/* Footer legal */}
            <p className="mt-6 text-center text-xs text-slate-500">
              Al continuar aceptas nuestros <a href="#/terminos" className="underline underline-offset-2">Términos</a> y la <a href="#/privacidad" className="underline underline-offset-2">Política de Privacidad</a>.
            </p>
          </form>
        </section>
      </div>
    </main>
  );
};

export default Login;
