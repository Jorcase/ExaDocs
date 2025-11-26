<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCarreraRequest;
use App\Http\Requests\UpdateCarreraRequest;
use App\Models\Carrera;
use App\Models\TipoCarrera;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Exports\CarrerasExport;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Builder;

class CarreraController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->string('search');
        $codigo = $request->string('codigo');
        $estado = $request->input('estado', []);
        $tipoCarreraIds = $request->input('tipo_carrera_ids', []);
        $sort = $request->input('sort', 'id');
        $direction = $request->input('direction', 'desc');

        $table = (new Carrera())->getTable();
        $query = $this->buildFilteredQuery($request);

        [$sort, $direction] = $this->normalizeSort($sort, $direction);
        $this->applySorting($query, $table, $sort, $direction);

        return inertia('carreras/index', [
            'carreras' => $query->paginate(10)->withQueryString(),
            'filters' => [
                'search' => $search->value(),
                'codigo' => $codigo->value(),
                'estado' => is_array($estado) ? $estado : [],
                'tipo_carrera_ids' => is_array($tipoCarreraIds) ? $tipoCarreraIds : [],
                'sort' => $sort,
                'direction' => $direction,
            ],
            'tipos' => TipoCarrera::select('id', 'nombre')->orderBy('nombre')->get(),
            'codigos' => Carrera::select('codigo')->distinct()->pluck('codigo')->filter()->values(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return inertia('carreras/create', [
            'carrera' => new Carrera(),
            'tipos' => TipoCarrera::select('id', 'nombre')->orderBy('nombre')->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCarreraRequest $request)
    {
        $carrera = Carrera::create($request->validated());

        return redirect()
            ->route('carreras.index')
            ->with('success', "Carrera {$carrera->nombre} creada correctamente.");
    }

    /**
     * Display the specified resource.
     */
    public function show(Carrera $carrera)
    {
        return inertia('carreras/show', [
            'carrera' => $carrera,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Carrera $carrera)
    {
        return inertia('carreras/edit', [
            'carrera' => $carrera,
            'tipos' => TipoCarrera::select('id', 'nombre')->orderBy('nombre')->get(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCarreraRequest $request, Carrera $carrera)
    {
        $carrera->update($request->validated());

        return redirect()
            ->route('carreras.index')
            ->with('success', "Carrera {$carrera->nombre} actualizada correctamente.");
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Carrera $carrera)
    {
        $carrera->delete();

        return redirect()
            ->route('carreras.index')
            ->with('success', "Carrera {$carrera->nombre} eliminada correctamente.");
    }

    public function generateReport(Request $request)
    {
        $sort = $request->input('sort', 'id');
        $direction = $request->input('direction', 'desc');
        [$sort, $direction] = $this->normalizeSort($sort, $direction);

        $table = (new Carrera())->getTable();
        $query = $this->buildFilteredQuery($request);
        $this->applySorting($query, $table, $sort, $direction);

        $carreras = $query
            ->select("{$table}.id", "{$table}.nombre", "{$table}.codigo", "{$table}.descripcion", "{$table}.estado", "{$table}.tipo_carrera_id")
            ->get();
        $pdf = Pdf::loadView('pdf.carreras', compact('carreras'));
        return $pdf->stream('carreras.pdf');
    }
    public function exportCarreras()
    {
        $request = request();
        $sort = $request->input('sort', 'id');
        $direction = $request->input('direction', 'desc');
        [$sort, $direction] = $this->normalizeSort($sort, $direction);

        $table = (new Carrera())->getTable();
        $query = $this->buildFilteredQuery($request);
        $this->applySorting($query, $table, $sort, $direction);

        $carreras = $query->select("{$table}.id", "{$table}.nombre", "{$table}.codigo", "{$table}.descripcion", "{$table}.tipo_carrera_id")->get();

        return Excel::download(new CarrerasExport($carreras), 'carreras.xlsx');
    }

    private function buildFilteredQuery(Request $request): Builder
    {
        $search = $request->string('search');
        $codigo = $request->string('codigo');
        $estado = $request->input('estado', []);
        $tipoCarreraIds = $request->input('tipo_carrera_ids', []);

        $query = Carrera::with('tipoCarrera:id,nombre');

        if ($search->isNotEmpty()) {
            $query->where('nombre', 'like', '%' . $search . '%');
        }

        if ($codigo->isNotEmpty()) {
            $query->where('codigo', 'like', '%' . $codigo . '%');
        }

        if (is_array($estado) && count($estado)) {
            $query->whereIn('estado', $estado);
        }

        if (is_array($tipoCarreraIds) && count($tipoCarreraIds)) {
            $query->whereIn('tipo_carrera_id', $tipoCarreraIds);
        }

        return $query;
    }

    private function normalizeSort(string $sort, string $direction): array
    {
        $allowedSorts = ['id', 'nombre', 'codigo', 'estado', 'tipo'];
        if (!in_array($sort, $allowedSorts, true)) {
            $sort = 'id';
        }
        $direction = $direction === 'asc' ? 'asc' : 'desc';

        return [$sort, $direction];
    }

    private function applySorting(Builder $query, string $table, string $sort, string $direction): void
    {
        if ($sort === 'tipo') {
            $query->leftJoin('tipo_carreras', 'tipo_carreras.id', '=', "{$table}.tipo_carrera_id")
                ->orderBy('tipo_carreras.nombre', $direction)
                ->select("{$table}.*");
        } else {
            $query->orderBy("{$table}.{$sort}", $direction);
        }
    }
}
