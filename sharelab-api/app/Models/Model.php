<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model as EloquentModel;

/**
 * Shared base model so domain models do not depend on an undefined class.
 */
abstract class Model extends EloquentModel
{
    //
}
