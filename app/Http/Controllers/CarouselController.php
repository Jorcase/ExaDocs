<?php

namespace App\Http\Controllers;

use Laravel\Fortify\Features;
use Illuminate\Http\Request;
use App\Models\Carousel;
use Inertia\Inertia;

class CarouselController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $images = Carousel::orderBy('priority')->pluck('url')->toArray();

        return Inertia::render('welcome', [
            'carouselImages' => $images,
            'canRegister' => Features::enabled(Features::registration()),
        ]);
    }

    public function adminList()
    {
        $items = Carousel::orderBy('priority')->get();
        return Inertia::render('carousel/index', [
            'items' => $items,
        ]);
    }

    public function create()
    {
        return Inertia::render('carousel/create', [
            'item' => new Carousel(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'url' => ['required', 'url', 'max:500'],
            'title' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'priority' => ['nullable', 'integer', 'min:0'],
        ]);

        if (!isset($data['priority'])) {
            $data['priority'] = (Carousel::max('priority') ?? 0) + 1;
        }

        Carousel::create($data);

        return redirect()->route('carousel.index')->with('success', 'Slide creado correctamente.');
    }

    public function edit(Carousel $carousel)
    {
        return Inertia::render('carousel/edit', [
            'item' => $carousel,
        ]);
    }

    public function update(Request $request, Carousel $carousel)
    {
        $data = $request->validate([
            'url' => ['required', 'url', 'max:500'],
            'title' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'priority' => ['nullable', 'integer', 'min:0'],
        ]);

        $carousel->update($data);

        return redirect()->route('carousel.index')->with('success', 'Slide actualizado.');
    }

    public function destroy(Carousel $carousel)
    {
        $carousel->delete();
        return redirect()->route('carousel.index')->with('success', 'Slide eliminado.');
    }
}
