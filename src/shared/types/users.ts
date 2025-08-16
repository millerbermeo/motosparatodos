export interface Usuario {
  id: string;
  name: string;
  lastname: string;
  username: string;
  pass?: string;
  phone: string;
  rol: any;
  state: 0 | 1;
  cedula: string;
  fecha_exp: string;
}
export type NewUsuario = Omit<Usuario, "id">;


// export type UpdateUsuarioInput = {
//   id: string;
//   data: NewUsuario; // mismos campos que al crear (sin id)
// };


export type UsuariosResponse = {
  usuarios: Usuario[];
};