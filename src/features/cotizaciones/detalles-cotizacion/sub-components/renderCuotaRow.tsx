import { fmtCOP } from '../../utils';

const renderCuotaRow = (label: string, valor?: number) =>
  typeof valor === 'number' ? (
    <tr key={label}>
      <td>{label}</td>
      <td className="text-right">{fmtCOP(valor)} COP</td>
    </tr>
  ) : null;

export default renderCuotaRow