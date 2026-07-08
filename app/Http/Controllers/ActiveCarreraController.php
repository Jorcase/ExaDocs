<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ActiveCarreraController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'carrera_id' => ['required', 'exists:carreras,id'],
        ]);

        session(['active_carrera_id' => (int) $request->carrera_id]);

        return back()->with('success', 'Carrera activa seleccionada correctamente.');
    }
}
